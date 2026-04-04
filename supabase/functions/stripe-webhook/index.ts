// Supabase Edge Function — handles Stripe webhook events
// Deploy: supabase functions deploy stripe-webhook
// Env vars needed:
//   STRIPE_SECRET_KEY
//   STRIPE_WEBHOOK_SECRET  (from Stripe dashboard → Webhooks → signing secret)
//
// Register this URL in Stripe dashboard:
//   https://<project-ref>.supabase.co/functions/v1/stripe-webhook
// Listen for: checkout.session.completed, payment_intent.payment_failed

import Stripe from 'https://esm.sh/stripe@14?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2?target=deno'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2024-04-10',
  httpClient: Stripe.createFetchHttpClient(),
})

const corsHeaders = { 'Access-Control-Allow-Origin': '*' }

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

  // Use service role key so we can write without RLS restrictions
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  )

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    // Create order row
    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .insert({
        stripe_payment_id: session.payment_intent as string,
        status:            'paid',
        total_cents:       session.amount_total ?? 0,
        guest_email:       session.customer_details?.email ?? null,
      })
      .select('id')
      .single()

    if (orderErr) {
      console.error('[stripe-webhook] failed to create order:', orderErr)
      return new Response('DB error', { status: 500 })
    }

    // Create order_item rows from metadata
    const rawItems = session.metadata?.items
    if (rawItems && order) {
      const items = JSON.parse(rawItems) as { typeKey: string; qty: number; unitPrice: number }[]
      const orderItems = items.map(item => ({
        order_id:        order.id,
        product_id:      null, // linked by typeKey in Phase 3 when products table is populated
        seller_id:       null,
        qty:             item.qty,
        unit_price_cents: Math.round(item.unitPrice * 100),
        type_key:        item.typeKey,
      }))
      await supabase.from('order_items').insert(orderItems)
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
