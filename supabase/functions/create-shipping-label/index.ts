// Supabase Edge Function — creates a Shippo shipping label for an order item.
//
// v1 flow:
// 1. Seller's caller JWT is checked against order_items.seller_id (RLS-style)
// 2. Pull from-address from seller's profile, to-address from order.shipping_address
// 3. Default parcel: 12x9x3 inches, 16oz (typical mid-sized box). Override-able
//    later from the seller settings or per-product physical attributes.
// 4. POST /shipments to Shippo → get rates
// 5. Pick cheapest USPS rate (Ground Advantage / First Class / Priority depending
//    on what's returned). Fall back to cheapest overall if no USPS option.
// 6. POST /transactions with the chosen rate to actually purchase the label
// 7. Save tracking_number, label_url, shippo_transaction_id, etc. to order_items
//    via the SECURITY DEFINER stamp RPC
//
// Deploy: supabase functions deploy create-shipping-label
// Env vars: SHIPPO_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_ANON_KEY

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2?target=deno'
import { sendEmail, shippingNotificationEmail, trackingUrlFor } from '../_shared/emails.ts'

const SHIPPO_API = 'https://api.goshippo.com'

const corsHeaders = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { orderItemId, parcel } = await req.json()
    if (!orderItemId) return json({ error: 'Missing orderItemId' }, 400)

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return json({ error: 'Missing auth' }, 401)

    const callerClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } },
    )
    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // Verify caller's identity from the JWT
    const { data: userData } = await callerClient.auth.getUser()
    const callerId = userData?.user?.id
    if (!callerId) return json({ error: 'Auth failed' }, 401)

    // Pull the order_item with order + seller profile context
    const { data: item, error: itemErr } = await adminClient
      .from('order_items')
      .select(`
        id, seller_id, quantity, label_url, tracking_number,
        product_name, products(label),
        orders(id, shipping_address, status, shippo_rate_id, shipping_cost_cents, guest_email, user_id)
      `)
      .eq('id', orderItemId)
      .single()
    if (itemErr || !item) return json({ error: 'Order item not found' }, 404)
    if (item.seller_id !== callerId) return json({ error: 'Not authorized' }, 403)
    if (item.label_url) return json({ error: 'Label already exists for this item' }, 400)
    if (!item.orders?.shipping_address) return json({ error: 'No shipping address on order' }, 400)

    // Buyer email for the "your package is on the way" notification. Prefer
    // the address-block email (collected at checkout), then guest_email, then
    // look up the auth user as a last resort. Null is fine — we just skip.
    const shipAddr = item.orders.shipping_address as Record<string, unknown> | null
    const shipAddrEmail = typeof shipAddr?.email === 'string' ? shipAddr.email : null
    let buyerEmail: string | null = shipAddrEmail || item.orders.guest_email || null
    if (!buyerEmail && item.orders.user_id) {
      const { data: u } = await adminClient.auth.admin.getUserById(item.orders.user_id)
      buyerEmail = u?.user?.email ?? null
    }
    const productDisplayLabel: string = item.product_name || item.products?.label || 'your order'

    // FAST PATH: buyer pre-paid a specific Shippo rate at checkout and the
    // caller isn't overriding the parcel (bundle flow). Buy the label
    // directly against that saved rate_id so the seller can't accidentally
    // pick a cheaper service than the buyer paid for (revenue leak) or a
    // more expensive one (platform eats the diff). Bundle/heavier-parcel
    // path still rerates below; we accept that documented cost-leak until
    // the bundle flow can re-quote against Shippo.
    const savedRateId = item.orders?.shippo_rate_id || null
    if (savedRateId && !parcel) {
      const fastTxRes = await fetch(`${SHIPPO_API}/transactions/`, {
        method: 'POST',
        headers: {
          'Authorization': `ShippoToken ${Deno.env.get('SHIPPO_API_KEY')}`,
          'Content-Type':  'application/json',
        },
        body: JSON.stringify({
          rate: savedRateId,
          label_file_type: 'PDF_4x6',
          async: false,
        }),
      })
      if (fastTxRes.ok) {
        const fastTx = await fastTxRes.json()
        if (fastTx.status === 'SUCCESS') {
          const { error: fastStampErr } = await callerClient.rpc('stamp_order_item_label', {
            p_item_id:      orderItemId,
            p_tracking:     fastTx.tracking_number,
            p_label_url:    fastTx.label_url,
            p_shippo_tx_id: fastTx.object_id,
            p_cost_cents:   typeof item.orders?.shipping_cost_cents === 'number'
                              ? item.orders.shipping_cost_cents
                              : Math.round(parseFloat(fastTx.rate?.amount ?? '0') * 100),
            p_carrier:      fastTx.rate?.provider ?? null,
            p_service:      fastTx.rate?.servicelevel?.name ?? fastTx.rate?.servicelevel?.token ?? null,
          })
          if (fastStampErr) {
            console.error('[create-shipping-label] fast-path stamp failed:', fastStampErr, 'tx:', fastTx.object_id)
            return json({ error: `Label purchased (${fastTx.object_id}) but DB stamp failed: ${fastStampErr.message}` }, 500)
          }
          if (buyerEmail) {
            const fastCarrier = fastTx.rate?.provider ?? 'Carrier'
            const fastService = fastTx.rate?.servicelevel?.name ?? fastTx.rate?.servicelevel?.token ?? null
            const { subject, html } = shippingNotificationEmail({
              carrier:        fastCarrier,
              service:        fastService,
              trackingNumber: fastTx.tracking_number,
              trackingUrl:    trackingUrlFor(fastCarrier, fastTx.tracking_number),
              itemLabel:      productDisplayLabel,
            })
            await sendEmail({ to: buyerEmail, subject, html })
          }
          return json({
            trackingNumber: fastTx.tracking_number,
            labelUrl:       fastTx.label_url,
            shippoTxId:     fastTx.object_id,
            cost:           fastTx.rate?.amount,
            carrier:        fastTx.rate?.provider,
            service:        fastTx.rate?.servicelevel?.name,
          })
        }
        // SUCCESS != 'SUCCESS' (rate may have expired). Fall through to rerate.
        console.warn('[create-shipping-label] saved rate failed, rerating:',
          (fastTx.messages || []).map((m: { text: string }) => m.text).join(', '))
      } else {
        console.warn('[create-shipping-label] saved rate http failed, rerating:', await fastTxRes.text())
      }
    }

    // Pull the seller's ship-from address from profile
    const { data: seller, error: sellerErr } = await adminClient
      .from('profiles')
      .select('ship_from_name, ship_from_company, ship_from_street1, ship_from_street2, ship_from_city, ship_from_state, ship_from_zip, ship_from_country, ship_from_phone, ship_from_email, display_name')
      .eq('id', callerId)
      .single()
    if (sellerErr || !seller) return json({ error: 'Seller profile not found' }, 404)
    if (!seller.ship_from_street1 || !seller.ship_from_city || !seller.ship_from_zip) {
      return json({ error: 'Add your ship-from address in Settings before generating labels' }, 400)
    }

    const addr_from = {
      name:     seller.ship_from_name || seller.display_name || 'Seller',
      company:  seller.ship_from_company || '',
      street1:  seller.ship_from_street1,
      street2:  seller.ship_from_street2 || '',
      city:     seller.ship_from_city,
      state:    seller.ship_from_state || '',
      zip:      seller.ship_from_zip,
      country:  normalizeCountry(seller.ship_from_country) || 'US',
      phone:    seller.ship_from_phone || '',
      email:    seller.ship_from_email || '',
    }

    const buyerAddr = item.orders.shipping_address
    const addr_to = {
      name:     buyerAddr.name || `${buyerAddr.first_name ?? ''} ${buyerAddr.last_name ?? ''}`.trim() || 'Recipient',
      street1:  buyerAddr.line1 || buyerAddr.address_line1 || buyerAddr.street1 || '',
      street2:  buyerAddr.line2 || buyerAddr.address_line2 || buyerAddr.street2 || '',
      city:     buyerAddr.city  || '',
      state:    buyerAddr.state || buyerAddr.region || '',
      zip:      buyerAddr.postal_code || buyerAddr.zip || '',
      country:  normalizeCountry(buyerAddr.country) || 'US',
      phone:    buyerAddr.phone || '',
      email:    buyerAddr.email || '',
    }
    if (!addr_to.street1 || !addr_to.city || !addr_to.zip) {
      return json({ error: 'Buyer shipping address is incomplete' }, 400)
    }

    // Default parcel — caller can override (per-product dims could be passed in)
    const parcelSpec = parcel || { length: '12', width: '9', height: '3', distance_unit: 'in', weight: '16', mass_unit: 'oz' }

    // Step 1: create a shipment, get rates
    const shipmentRes = await fetch(`${SHIPPO_API}/shipments/`, {
      method: 'POST',
      headers: {
        'Authorization': `ShippoToken ${Deno.env.get('SHIPPO_API_KEY')}`,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify({
        address_from: addr_from,
        address_to:   addr_to,
        parcels: [parcelSpec],
        async: false,
      }),
    })
    if (!shipmentRes.ok) {
      const err = await shipmentRes.text()
      console.error('[create-shipping-label] shipment failed:', err)
      return json({ error: `Shippo shipment error: ${err.slice(0, 300)}` }, 500)
    }
    const shipment = await shipmentRes.json()
    const rates = shipment.rates || []
    if (!rates.length) {
      return json({ error: 'No shipping rates returned. Check your ship-from address and the buyer address.' }, 500)
    }

    // Pick cheapest USPS rate; fall back to absolute cheapest if USPS unavailable.
    const numericAmount = (r: { amount: string }) => parseFloat(r.amount)
    const uspsRates = rates.filter((r: { provider: string }) => r.provider === 'USPS')
    const candidatePool = uspsRates.length ? uspsRates : rates
    const chosen = candidatePool.reduce((a: { amount: string }, b: { amount: string }) =>
      numericAmount(a) <= numericAmount(b) ? a : b
    )

    // Step 2: purchase the label by creating a transaction
    const txRes = await fetch(`${SHIPPO_API}/transactions/`, {
      method: 'POST',
      headers: {
        'Authorization': `ShippoToken ${Deno.env.get('SHIPPO_API_KEY')}`,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify({
        rate: chosen.object_id,
        // 4x6 thermal label PDF — standard format for Rollo/Brother/Zebra
        // shipping label printers. Also prints fine on regular paper (cut/fold).
        label_file_type: 'PDF_4x6',
        async: false,
      }),
    })
    if (!txRes.ok) {
      const err = await txRes.text()
      console.error('[create-shipping-label] transaction failed:', err)
      return json({ error: `Shippo label purchase error: ${err.slice(0, 300)}` }, 500)
    }
    const tx = await txRes.json()
    if (tx.status !== 'SUCCESS') {
      const msgs = (tx.messages || []).map((m: { text: string }) => m.text).join(', ')
      return json({ error: `Label not created: ${msgs || tx.status}` }, 500)
    }

    // Stamp the order_item using the SECURITY DEFINER RPC (gates on seller_id)
    const { error: stampErr } = await callerClient.rpc('stamp_order_item_label', {
      p_item_id:        orderItemId,
      p_tracking:       tx.tracking_number,
      p_label_url:      tx.label_url,
      p_shippo_tx_id:   tx.object_id,
      p_cost_cents:     Math.round(parseFloat(chosen.amount) * 100),
      p_carrier:        chosen.provider,
      p_service:        chosen.servicelevel?.name || chosen.servicelevel?.token || null,
    })
    if (stampErr) {
      console.error('[create-shipping-label] stamp failed:', stampErr, 'tx:', tx.object_id)
      return json({ error: `Label purchased (${tx.object_id}) but DB stamp failed: ${stampErr.message}` }, 500)
    }

    if (buyerEmail) {
      const svc = chosen.servicelevel?.name || chosen.servicelevel?.token || null
      const { subject, html } = shippingNotificationEmail({
        carrier:        chosen.provider,
        service:        svc,
        trackingNumber: tx.tracking_number,
        trackingUrl:    trackingUrlFor(chosen.provider, tx.tracking_number),
        itemLabel:      productDisplayLabel,
      })
      await sendEmail({ to: buyerEmail, subject, html })
    }

    return json({
      trackingNumber: tx.tracking_number,
      labelUrl:       tx.label_url,
      shippoTxId:     tx.object_id,
      cost:           chosen.amount,
      carrier:        chosen.provider,
      service:        chosen.servicelevel?.name,
    })
  } catch (err) {
    console.error('[create-shipping-label]', err)
    return json({ error: (err as Error).message }, 500)
  }
})

// Map common country name variants to their ISO 2-letter codes for Shippo.
// Shippo requires ISO 3166-1 alpha-2 (e.g. 'US', 'CA') — full names + ISO-3 fail.
function normalizeCountry(c: string | null | undefined): string {
  if (!c) return ''
  const upper = c.trim().toUpperCase()
  const map: Record<string, string> = {
    'USA': 'US', 'UNITED STATES': 'US', 'UNITED STATES OF AMERICA': 'US',
    'CAN': 'CA', 'CANADA': 'CA',
    'GBR': 'GB', 'UNITED KINGDOM': 'GB', 'UK': 'GB',
    'AUS': 'AU', 'AUSTRALIA': 'AU',
    'MEX': 'MX', 'MEXICO': 'MX',
  }
  return map[upper] || (upper.length === 2 ? upper : '')
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}
