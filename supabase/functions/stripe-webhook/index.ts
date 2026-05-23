// Supabase Edge Function — handles Stripe webhook events
// Deploy: supabase functions deploy stripe-webhook
// Env vars needed:
//   STRIPE_SECRET_KEY
//   STRIPE_WEBHOOK_SECRET  (from Stripe dashboard → Webhooks → signing secret)
//   RESEND_API_KEY

import Stripe from 'https://esm.sh/stripe@14?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2?target=deno'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2024-04-10',
  httpClient: Stripe.createFetchHttpClient(),
})

const corsHeaders = { 'Access-Control-Allow-Origin': '*' }

async function sendEmail(to: string, subject: string, html: string) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'DaydreamDwelling <orders@daydreamdwelling.com>',
      to,
      subject,
      html,
    }),
  })
  if (!res.ok) {
    const err = await res.text()
    console.error('[stripe-webhook] resend error:', err)
  }
}

function customerEmailHtml(items: { label: string; sizeLabel: string; qty: number; unitPrice: number }[], totalCents: number) {
  const rows = items.map(it => `
    <tr>
      <td style="padding:10px 16px;border-bottom:1px solid #2a2a3a;color:#e0d9ff;font-size:14px;">${it.label}${it.sizeLabel ? ` <span style="color:#7878aa;font-size:12px;">· ${it.sizeLabel}</span>` : ''}</td>
      <td style="padding:10px 16px;border-bottom:1px solid #2a2a3a;color:#a090c8;font-size:14px;text-align:center;">×${it.qty}</td>
      <td style="padding:10px 16px;border-bottom:1px solid #2a2a3a;color:#c0b8ff;font-size:14px;text-align:right;font-weight:600;">$${(it.unitPrice * it.qty).toLocaleString()}</td>
    </tr>`).join('')

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0e0c1e;font-family:system-ui,-apple-system,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0e0c1e;padding:40px 20px;">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="background:#1a1430;border:1px solid rgba(154,122,238,0.25);border-radius:20px;overflow:hidden;max-width:100%;">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#1a1430 0%,#2a1a50 100%);padding:36px 32px 28px;text-align:center;border-bottom:1px solid rgba(154,122,238,0.2);">
            <p style="margin:0 0 8px;font-size:28px;font-weight:800;color:#f0eaff;letter-spacing:-0.5px;">DaydreamDwelling</p>
            <p style="margin:0;font-size:14px;color:#9a7aee;">Your order is confirmed ✓</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:28px 32px;">
            <p style="margin:0 0 20px;font-size:15px;color:#c0b0e8;line-height:1.6;">
              Thank you for your order! Your items are being prepared and you'll receive a shipping notification once they're on their way.
            </p>

            <!-- Order table -->
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #2a2a3a;border-radius:10px;overflow:hidden;margin-bottom:20px;">
              <tr style="background:#12102a;">
                <th style="padding:10px 16px;text-align:left;font-size:10px;color:#7878aa;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Item</th>
                <th style="padding:10px 16px;text-align:center;font-size:10px;color:#7878aa;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Qty</th>
                <th style="padding:10px 16px;text-align:right;font-size:10px;color:#7878aa;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Price</th>
              </tr>
              ${rows}
              <tr style="background:#12102a;">
                <td colspan="2" style="padding:12px 16px;font-size:12px;font-weight:700;color:#7878aa;text-transform:uppercase;letter-spacing:1px;">Total</td>
                <td style="padding:12px 16px;font-size:18px;font-weight:800;color:#e0d9ff;text-align:right;">$${(totalCents / 100).toLocaleString()}</td>
              </tr>
            </table>

            <p style="margin:0;font-size:12px;color:#5a4a7a;line-height:1.6;text-align:center;">
              Questions? Reply to this email and we'll get back to you.<br>
              Keep decorating — your dream room awaits. 🛋️
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:20px 32px;background:#12102a;border-top:1px solid rgba(154,122,238,0.15);text-align:center;">
            <p style="margin:0;font-size:11px;color:#3a2a5a;">© DaydreamDwelling · daydreamdwelling.com</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}

function sellerEmailHtml(items: { label: string; sizeLabel: string; qty: number; unitPrice: number }[], totalCents: number, customerEmail: string) {
  const rows = items.map(it => `
    <tr>
      <td style="padding:8px 14px;border-bottom:1px solid #eee;font-size:14px;">${it.label}${it.sizeLabel ? ` · ${it.sizeLabel}` : ''}</td>
      <td style="padding:8px 14px;border-bottom:1px solid #eee;font-size:14px;text-align:center;">×${it.qty}</td>
      <td style="padding:8px 14px;border-bottom:1px solid #eee;font-size:14px;text-align:right;font-weight:600;">$${(it.unitPrice * it.qty).toLocaleString()}</td>
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
          <td style="padding:10px 14px;font-weight:800;font-size:16px;text-align:right;">$${(totalCents / 100).toLocaleString()}</td>
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

    // Branch: artist PPC balance top-up — credit the artist instead of creating an order
    if (session.metadata?.purpose === 'artist_ppc_topup') {
      const artistId    = session.metadata.artist_id
      const creditCents = parseInt(session.metadata.credit_cents ?? '0', 10)

      if (artistId && creditCents > 0) {
        const { data: artist } = await supabase
          .from('artist_profiles')
          .select('ppc_balance_cents, artist_name')
          .eq('user_id', artistId)
          .single()

        if (artist) {
          await supabase
            .from('artist_profiles')
            .update({ ppc_balance_cents: (artist.ppc_balance_cents ?? 0) + creditCents })
            .eq('user_id', artistId)

          if (customerEmail) {
            await sendEmail(
              customerEmail,
              `Your DaydreamDwelling artist balance is topped up — $${(creditCents / 100).toFixed(2)}`,
              `<p>Hi ${artist.artist_name},</p>
               <p>Your PPC balance has been credited <strong>$${(creditCents / 100).toFixed(2)}</strong>.
               It's ready to fund click-throughs from your tracks immediately.</p>
               <p>— DaydreamDwelling</p>`,
            )
          }
        }
      }

      return new Response(JSON.stringify({ received: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Default: product checkout — create order row
    const buyerMood     = session.metadata?.buyer_mood ?? null
    const buyerRoomName = session.metadata?.buyer_room_name ?? null

    // Buyer-paid shipping bundle from create-checkout metadata
    const shippoRateId        = session.metadata?.shippo_rate_id ?? null
    const shippingCostCents   = session.metadata?.shipping_cost_cents
      ? parseInt(session.metadata.shipping_cost_cents, 10)
      : null
    const shippingCarrier     = session.metadata?.shipping_carrier ?? null
    const shippingService     = session.metadata?.shipping_service ?? null

    // Buyer's shipping address: prefer the one stamped in metadata at quote
    // time (it's what they confirmed rates against). Fall back to Stripe's
    // customer_details.address if metadata isn't present.
    let shippingAddress: Record<string, unknown> | null = null
    if (session.metadata?.buyer_address) {
      try { shippingAddress = JSON.parse(session.metadata.buyer_address) } catch { /* ignore */ }
    }
    if (!shippingAddress && session.customer_details?.address) {
      const a = session.customer_details.address
      shippingAddress = {
        name: session.customer_details.name ?? null,
        email: customerEmail,
        line1: a.line1, line2: a.line2,
        city: a.city, state: a.state, postal_code: a.postal_code, country: a.country,
      }
    }

    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .insert({
        stripe_payment_id: session.payment_intent as string,
        status:            'paid',
        total_cents:       session.amount_total ?? 0,
        guest_email:       customerEmail,
        buyer_mood:        buyerMood,
        buyer_room_name:   buyerRoomName,
        shipping_address:  shippingAddress,
        shipping_cost_cents: shippingCostCents,
        shipping_carrier:    shippingCarrier,
        shipping_service:    shippingService,
        shippo_rate_id:      shippoRateId,
      })
      .select('id')
      .single()

    if (orderErr) {
      console.error('[stripe-webhook] failed to create order:', orderErr)
      return new Response('DB error', { status: 500 })
    }

    // Create order_item rows from metadata
    const rawItems = session.metadata?.items
    let parsedItems: { typeKey: string; label: string; sizeLabel: string; qty: number; unitPrice: number; sellerId?: string }[] = []

    if (rawItems && order) {
      parsedItems = JSON.parse(rawItems)
      const orderItems = parsedItems.map(item => ({
        order_id:         order.id,
        product_id:       null,
        seller_id:        item.sellerId ?? null,
        qty:              item.qty,
        unit_price_cents: Math.round(item.unitPrice * 100),
        type_key:         item.typeKey,
      }))
      await supabase.from('order_items').insert(orderItems)
    }

    // Send customer confirmation email
    const totalCents = session.amount_total ?? 0
    if (customerEmail) {
      await sendEmail(
        customerEmail,
        'Your DaydreamDwelling order is confirmed!',
        customerEmailHtml(parsedItems, totalCents),
      )
    }

    // Group items by seller and email each one
    const sellerIds = [...new Set(parsedItems.map(i => i.sellerId).filter(Boolean))] as string[]
    if (sellerIds.length > 0) {
      const { data: users } = await supabase.auth.admin.listUsers()

      for (const sellerId of sellerIds) {
        const sellerItems = parsedItems.filter(i => i.sellerId === sellerId)
        const sellerTotal = sellerItems.reduce((s, i) => s + Math.round(i.unitPrice * 100) * i.qty, 0)
        const sellerUser  = users?.users?.find((u: { id: string }) => u.id === sellerId)
        const sellerEmail = sellerUser?.email
        if (sellerEmail) {
          await sendEmail(
            sellerEmail,
            `New order — $${(sellerTotal / 100).toFixed(2)}`,
            sellerEmailHtml(sellerItems, sellerTotal, customerEmail ?? 'Guest'),
          )
        }
      }
    }

    // Always notify admin too
    const adminEmail = Deno.env.get('ADMIN_EMAIL')
    if (adminEmail) {
      await sendEmail(
        adminEmail,
        `New order — $${(totalCents / 100).toFixed(2)}`,
        sellerEmailHtml(parsedItems, totalCents, customerEmail ?? 'Guest'),
      )
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
