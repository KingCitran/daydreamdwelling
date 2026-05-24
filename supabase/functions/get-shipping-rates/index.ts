// Supabase Edge Function — quotes shipping rates for a cart + destination
// before the buyer hits Stripe Checkout.
//
// v1 returns ONE rate (cheapest USPS) for a single-seller cart. Multi-seller
// carts: this function picks the seller of the first item — should be
// extended to one rate-per-seller when multi-seller carts become common.
//
// The "from address" is the seller's ship-from from their profile. If the
// seller hasn't set one yet we error clearly so the buyer/cart sees a real
// message instead of a silent shipping=0.
//
// Deploy: supabase functions deploy get-shipping-rates
// Env vars: SHIPPO_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

import { createClient } from 'npm:@supabase/supabase-js@2'

const SHIPPO_API = 'https://api.goshippo.com'

const corsHeaders = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CartItem { typeKey: string; sellerId?: string | null; qty: number; unitPrice: number; label?: string }

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    // AUTH GATE — without this, anyone on the internet can spam Shippo rate
    // quotes (each call costs us in live mode) and bulk-probe seller ship-from
    // zips by diffing rates. We only require a Bearer token (either a signed-in
    // user JWT or the project anon key auto-sent by supabase.functions.invoke);
    // guest checkout still works because supabase-js always sends an anon JWT.
    // Real rate-limiting (per-IP, per-user) is a TODO on the plan; this is the
    // floor that blocks naive curl/scripted abuse.
    const authHeader = req.headers.get('Authorization') ?? ''
    if (!authHeader.toLowerCase().startsWith('bearer ') || authHeader.length < 20) {
      return json({ error: 'Missing or malformed auth' }, 401)
    }

    const { items, address } = await req.json() as { items: CartItem[]; address: Record<string, string> }
    if (!items?.length) return json({ error: 'No items in cart' }, 400)
    if (!address?.line1 || !address?.city || !address?.postal_code) {
      return json({ error: 'Address is missing required fields (line1, city, postal_code)' }, 400)
    }

    // Pick the first item's seller as the source of the ship-from address.
    // v1 only supports single-seller shipments; will need to fan out per seller
    // when multi-seller carts become real.
    const sellerId = items.find(i => i.sellerId)?.sellerId
    if (!sellerId) return json({ error: 'No seller on cart items — cannot quote shipping' }, 400)

    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const { data: seller, error: sellerErr } = await adminClient
      .from('profiles')
      .select('ship_from_name, ship_from_company, ship_from_street1, ship_from_street2, ship_from_city, ship_from_state, ship_from_zip, ship_from_country, ship_from_phone, ship_from_email, display_name')
      .eq('id', sellerId)
      .single()
    if (sellerErr || !seller) return json({ error: 'Seller profile not found' }, 404)
    if (!seller.ship_from_street1 || !seller.ship_from_city || !seller.ship_from_zip) {
      return json({ error: 'Seller has not set up their ship-from address yet — they cannot accept orders right now' }, 400)
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
    const addr_to = {
      name:     address.name || 'Recipient',
      street1:  address.line1,
      street2:  address.line2 || '',
      city:     address.city,
      state:    address.state || '',
      zip:      address.postal_code,
      country:  normalizeCountry(address.country) || 'US',
      phone:    address.phone || '',
      email:    address.email || '',
    }

    // Default parcel — same as create-shipping-label. Per-product physical
    // dimensions (migration 026) could refine this when multi-item carts
    // start mattering for accurate rates.
    const parcel = { length: '12', width: '9', height: '3', distance_unit: 'in', weight: '16', mass_unit: 'oz' }

    const shipmentRes = await fetch(`${SHIPPO_API}/shipments/`, {
      method: 'POST',
      headers: {
        'Authorization': `ShippoToken ${Deno.env.get('SHIPPO_API_KEY')}`,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify({
        address_from: addr_from,
        address_to:   addr_to,
        parcels: [parcel],
        async: false,
      }),
    })
    if (!shipmentRes.ok) {
      const err = await shipmentRes.text()
      return json({ error: `Shippo rate error: ${err.slice(0, 300)}` }, 500)
    }
    const shipment = await shipmentRes.json()
    const rates = shipment.rates || []
    if (!rates.length) {
      return json({ error: 'No shipping rates available for this address' }, 500)
    }

    const numericAmount = (r: { amount: string }) => parseFloat(r.amount)
    const uspsRates = rates.filter((r: { provider: string }) => r.provider === 'USPS')
    const pool = uspsRates.length ? uspsRates : rates
    const cheapest = pool.reduce((a: { amount: string }, b: { amount: string }) =>
      numericAmount(a) <= numericAmount(b) ? a : b
    ) as { object_id: string; amount: string; currency: string; provider: string; servicelevel?: { name?: string; token?: string }; estimated_days?: number }

    return json({
      rateId:        cheapest.object_id,
      amount:        cheapest.amount,
      currency:      cheapest.currency,
      carrier:       cheapest.provider,
      service:       cheapest.servicelevel?.name || cheapest.servicelevel?.token || '',
      estimatedDays: cheapest.estimated_days ?? null,
    })
  } catch (err) {
    console.error('[get-shipping-rates]', err)
    return json({ error: (err as Error).message }, 500)
  }
})

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
