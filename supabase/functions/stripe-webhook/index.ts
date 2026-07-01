// Supabase Edge Function — handles Stripe webhook events
// Deploy: supabase functions deploy stripe-webhook
// Env vars needed:
//   STRIPE_SECRET_KEY
//   STRIPE_WEBHOOK_SECRET  (from Stripe dashboard → Webhooks → signing secret)
//   RESEND_API_KEY

import Stripe from 'https://esm.sh/stripe@14?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2?target=deno'
import { sendEmail, orderConfirmationEmail } from '../_shared/emails.ts'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2024-04-10',
  httpClient: Stripe.createFetchHttpClient(),
})

const corsHeaders = { 'Access-Control-Allow-Origin': '*' }

// Customer order-confirmation copy lives in _shared/emails.ts as Wispy-voiced
// orderConfirmationEmail(). The seller new-order template below stays inline
// because it's transactional (operations) and intentionally not in Wispy voice.

function sellerEmailHtml(items: { label: string; sizeLabel: string; qty: number; unitPrice: number }[], totalCents: number, customerEmail: string) {
  const rows = items.map(it => `
    <tr>
      <td style="padding:8px 14px;border-bottom:1px solid #eee;font-size:14px;">${it.label}${it.sizeLabel ? ` · ${it.sizeLabel}` : ''}</td>
      <td style="padding:8px 14px;border-bottom:1px solid #eee;font-size:14px;text-align:center;">×${it.qty}</td>
      <td style="padding:8px 14px;border-bottom:1px solid #eee;font-size:14px;text-align:right;font-weight:600;">$${(it.unitPrice * it.qty).toFixed(2)}</td>
    </tr>`).join('')

  return `<!DOCTYPE html>
<html>
<body style="margin:0;padding:32px 20px;background:#f5f5f5;font-family:system-ui,-apple-system,sans-serif;">
  <table width="520" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;max-width:100%;margin:0 auto;border:1px solid #e0e0e0;">
    <tr><td style="background:#1a1430;padding:24px 28px;">
      <p style="margin:0;font-size:18px;font-weight:700;color:#f0eaff;">New Order — DaydreamDwelling</p>
      <p style="margin:4px 0 0;font-size:13px;color:#9a7aee;">You have a new order to fulfill</p>
    </td></tr>
    <tr><td style="padding:24px 28px;">
      <p style="margin:0 0 16px;font-size:14px;color:#444;">Customer: <strong>${customerEmail}</strong></p>
      <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e0e0e0;border-radius:8px;overflow:hidden;margin-bottom:16px;">
        <tr style="background:#f9f9f9;">
          <th style="padding:8px 14px;text-align:left;font-size:11px;color:#888;text-transform:uppercase;">Item</th>
          <th style="padding:8px 14px;text-align:center;font-size:11px;color:#888;text-transform:uppercase;">Qty</th>
          <th style="padding:8px 14px;text-align:right;font-size:11px;color:#888;text-transform:uppercase;">Price</th>
        </tr>
        ${rows}
        <tr style="background:#f9f9f9;">
          <td colspan="2" style="padding:10px 14px;font-weight:700;font-size:13px;color:#666;">Total</td>
          <td style="padding:10px 14px;font-weight:800;font-size:16px;text-align:right;">$${(totalCents / 100).toFixed(2)}</td>
        </tr>
      </table>
      <p style="margin:0;font-size:13px;color:#666;">Log in to your seller dashboard to mark this order as packed and enter a tracking number.</p>
    </td></tr>
    <tr><td style="padding:16px 28px;background:#f9f9f9;border-top:1px solid #e0e0e0;text-align:center;">
      <p style="margin:0;font-size:11px;color:#aaa;">DaydreamDwelling Seller Notifications · daydreamsellers.com</p>
    </td></tr>
  </table>
</body>
</html>`
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const signature = req.headers.get('stripe-signature') ?? ''
  const body      = await req.text()

  let event: Stripe.Event
  try {
    event = await stripe.webhooks.constructEventAsync(
      body, signature, Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? ''
    )
  } catch (err) {
    console.error('[stripe-webhook] signature verification failed:', err)
    return new Response('Webhook signature invalid', { status: 400 })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  )

  if (event.type === 'checkout.session.completed') {
    const session     = event.data.object as Stripe.Checkout.Session
    const customerEmail = session.customer_details?.email ?? null

    // ── Idempotency: check if this session was already processed ──
    // Stripe can retry webhooks on timeout. If we already created an order
    // or credited PPC for this session, bail out safely.
    const { data: existingOrder } = await supabase
      .from('orders')
      .select('id')
      .eq('stripe_payment_id', session.payment_intent as string)
      .maybeSingle()
    if (existingOrder) {
      console.log('[stripe-webhook] already processed session', session.id, '→ order', existingOrder.id)
      return new Response(JSON.stringify({ received: true, already_processed: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Branch: artist PPC balance top-up — credit the artist instead of creating an order
    if (session.metadata?.purpose === 'artist_ppc_topup') {
      const artistId    = session.metadata.artist_id
      const creditCents = parseInt(session.metadata.credit_cents ?? '0', 10)

      // H3: Check if this PPC topup was already processed (consumed_at on pending_checkouts)
      const { data: ppcPending } = await supabase
        .from('pending_checkouts')
        .select('consumed_at')
        .eq('stripe_session_id', session.id)
        .maybeSingle()
      if (ppcPending?.consumed_at) {
        console.log('[stripe-webhook] PPC topup already processed for session', session.id)
        return new Response(JSON.stringify({ received: true, already_processed: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      if (artistId && creditCents > 0) {
        const { data: artist } = await supabase
          .from('artist_profiles')
          .select('ppc_balance_cents, artist_name')
          .eq('user_id', artistId)
          .single()

        if (artist) {
          // Stamp consumed_at first so retries don't double-credit
          await supabase
            .from('pending_checkouts')
            .update({ consumed_at: new Date().toISOString() })
            .eq('stripe_session_id', session.id)

          await supabase
            .from('artist_profiles')
            .update({ ppc_balance_cents: (artist.ppc_balance_cents ?? 0) + creditCents })
            .eq('user_id', artistId)

          if (customerEmail) {
            await sendEmail({
              to:      customerEmail,
              subject: `Your DaydreamDwelling artist balance is topped up — $${(creditCents / 100).toFixed(2)}`,
              html:    `<p>Hi ${artist.artist_name},</p>
               <p>Your PPC balance has been credited <strong>$${(creditCents / 100).toFixed(2)}</strong>.
               It's ready to fund click-throughs from your tracks immediately.</p>
               <p>— DaydreamDwelling</p>`,
            })
          }
        }
      }

      return new Response(JSON.stringify({ received: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Default: product checkout — create order row
    // Look up the full canonical cart + buyer context from pending_checkouts
    // (inserted by create-checkout). This is the new path — Stripe metadata
    // can't hold a multi-item canonical cart without overflowing 500 chars.
    // Old in-flight sessions that pre-date the table fall through to the
    // legacy metadata path below.
    interface CanonicalItem {
      productId: string | null; sellerId: string | null;
      sizeId: string | null; swatchId: string | null;
      productName: string; sizeLabel: string; swatchName: string;
      unitPriceCents: number; qty: number; typeKey: string;
    }
    const { data: pending } = await supabase
      .from('pending_checkouts')
      .select('items, buyer_user_id, buyer_email, buyer_mood, buyer_room_name, buyer_address, shippo_rate_id, shipping_cost_cents, shipping_carrier, shipping_service, estimated_delivery_days')
      .eq('stripe_session_id', session.id)
      .maybeSingle()

    const buyerMood     = pending?.buyer_mood     ?? session.metadata?.buyer_mood ?? null
    const buyerRoomName = pending?.buyer_room_name ?? session.metadata?.buyer_room_name ?? null

    // Buyer-paid shipping bundle — table first, legacy metadata fallback.
    const shippoRateId        = pending?.shippo_rate_id ?? session.metadata?.shippo_rate_id ?? null
    const shippingCostCents   = pending?.shipping_cost_cents
      ?? (session.metadata?.shipping_cost_cents ? parseInt(session.metadata.shipping_cost_cents, 10) : null)
    const shippingCarrier     = pending?.shipping_carrier ?? session.metadata?.shipping_carrier ?? null
    const shippingService     = pending?.shipping_service ?? session.metadata?.shipping_service ?? null

    // Shipping address: pending_checkouts is the new source of truth (the
    // buyer chose this address in our CheckoutModal and Shippo quoted
    // against it). Fall back to legacy metadata, then to Stripe's sparse
    // customer_details.address as a last resort (only if it has line1).
    let shippingAddress: Record<string, unknown> | null = (pending?.buyer_address as Record<string, unknown> | null) ?? null
    if (!shippingAddress && session.metadata?.buyer_address) {
      try { shippingAddress = JSON.parse(session.metadata.buyer_address) } catch { /* ignore */ }
    }
    const stripeAddr = session.customer_details?.address
    if (!shippingAddress && stripeAddr?.line1) {
      shippingAddress = {
        name: session.customer_details?.name ?? null,
        email: customerEmail,
        line1: stripeAddr.line1, line2: stripeAddr.line2,
        city: stripeAddr.city, state: stripeAddr.state,
        postal_code: stripeAddr.postal_code, country: stripeAddr.country,
      }
    }

    // Buyer's user_id — table first, then legacy metadata. Null for guest.
    const buyerUserId = pending?.buyer_user_id ?? session.metadata?.buyer_user_id ?? null

    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .insert({
        stripe_payment_id: session.payment_intent as string,
        status:            'paid',
        total_cents:       session.amount_total ?? 0,
        user_id:           buyerUserId,
        guest_email:       customerEmail,
        buyer_mood:        buyerMood,
        buyer_room_name:   buyerRoomName,
        shipping_address:  shippingAddress,
        shipping_cost_cents: shippingCostCents,
        shipping_carrier:    shippingCarrier,
        shipping_service:    shippingService,
        shippo_rate_id:      shippoRateId,
        estimated_delivery_days: pending?.estimated_delivery_days ?? null,
      })
      .select('id')
      .single()

    if (orderErr) {
      console.error('[stripe-webhook] failed to create order:', orderErr)
      return new Response('DB error', { status: 500 })
    }

    // Canonical order_items come from pending_checkouts.items (server-
    // validated at create-checkout time), with the old metadata.items JSON
    // as fallback for in-flight pre-table sessions.
    let parsedItems: CanonicalItem[] = []
    if (pending?.items) {
      parsedItems = pending.items as CanonicalItem[]
    } else if (session.metadata?.items) {
      try { parsedItems = JSON.parse(session.metadata.items) } catch { /* ignore */ }
    }

    // Stamp consumed_at BEFORE inserting items — if we crash after the
    // order insert but before this stamp, the idempotency check at the
    // top (existing order lookup) catches the retry instead.
    if (pending) {
      await supabase
        .from('pending_checkouts')
        .update({ consumed_at: new Date().toISOString() })
        .eq('stripe_session_id', session.id)
    }

    if (parsedItems.length && order) {
      const orderItems = parsedItems.map(item => ({
        order_id:         order.id,
        product_id:       item.productId,   // canonical, not null for live products
        seller_id:        item.sellerId,
        size_id:          item.sizeId,
        swatch_id:        item.swatchId,
        qty:              item.qty,
        unit_price_cents: item.unitPriceCents,
        type_key:         item.typeKey,
        product_name:     item.productName,
      }))
      const { error: itemsErr } = await supabase.from('order_items').insert(orderItems)
      if (itemsErr) {
        console.error('[stripe-webhook] order_items insert failed:', itemsErr, 'order:', order.id)
      }
    }

    // Convenience shape for the existing email templates (they were written
    // against {label, sizeLabel, qty, unitPrice}). Map canonical → display.
    const emailItems = parsedItems.map(i => ({
      label:     i.productName,
      sizeLabel: i.sizeLabel,
      qty:       i.qty,
      unitPrice: i.unitPriceCents / 100,
    }))

    // Send customer confirmation email (Wispy-voiced, from _shared/emails.ts)
    const totalCents = session.amount_total ?? 0
    if (customerEmail) {
      const { subject, html } = orderConfirmationEmail(emailItems, totalCents, shippingCostCents)
      await sendEmail({ to: customerEmail, subject, html })
    }

    // Group items by seller and email each one (transactional, not Wispy voice)
    const sellerIds = [...new Set(parsedItems.map(i => i.sellerId).filter(Boolean))] as string[]
    if (sellerIds.length > 0) {
      const { data: users } = await supabase.auth.admin.listUsers()

      for (const sellerId of sellerIds) {
        const sellerItems = parsedItems.filter(i => i.sellerId === sellerId)
        const sellerTotal = sellerItems.reduce((s, i) => s + i.unitPriceCents * i.qty, 0)
        const sellerEmailItems = sellerItems.map(i => ({
          label: i.productName, sizeLabel: i.sizeLabel, qty: i.qty, unitPrice: i.unitPriceCents / 100,
        }))
        const sellerUser  = users?.users?.find((u: { id: string }) => u.id === sellerId)
        const sellerEmail = sellerUser?.email
        if (sellerEmail) {
          await sendEmail({
            to:      sellerEmail,
            subject: `New order — $${(sellerTotal / 100).toFixed(2)}`,
            html:    sellerEmailHtml(sellerEmailItems, sellerTotal, customerEmail ?? 'Guest'),
            from:    'DaydreamDwelling <orders@daydreamdwelling.com>',
          })
        }
      }
    }

    // Always notify admin too
    const adminEmail = Deno.env.get('ADMIN_EMAIL')
    if (adminEmail) {
      await sendEmail({
        to:      adminEmail,
        subject: `New order — $${(totalCents / 100).toFixed(2)}`,
        html:    sellerEmailHtml(emailItems, totalCents, customerEmail ?? 'Guest'),
        from:    'DaydreamDwelling <orders@daydreamdwelling.com>',
      })
    }
  }

  if (event.type === 'payment_intent.payment_failed') {
    const pi = event.data.object as Stripe.PaymentIntent
    await supabase
      .from('orders')
      .update({ status: 'cancelled' })
      .eq('stripe_payment_id', pi.id)
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})
