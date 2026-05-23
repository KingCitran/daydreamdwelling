// Supabase Edge Function — creates a Stripe Checkout Session
// Deploy: supabase functions deploy create-checkout
// Env vars needed (set in Supabase dashboard → Project Settings → Edge Functions):
//   STRIPE_SECRET_KEY
//   SITE_URL  (e.g. https://daydreamdwelling.com)

import Stripe from 'https://esm.sh/stripe@14?target=deno'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2024-04-10',
  httpClient: Stripe.createFetchHttpClient(),
})

const corsHeaders = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { items, successUrl, cancelUrl, buyerMood, buyerRoom, shipping, address } = await req.json()
    // items: [{ typeKey, label, sizeLabel, swatchName, unitPrice, qty }]
    // buyerMood / buyerRoom: optional snapshot of the buyer's current room
    // context for the seller's "ordered for their X room" badge.

    if (!items?.length) {
      return new Response(JSON.stringify({ error: 'No items provided' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const siteUrl = Deno.env.get('SITE_URL') ?? 'http://localhost:5173'

    const lineItems = items.map((item: { label: string; sizeLabel: string; swatchName: string; unitPrice: number; qty: number }) => ({
      price_data: {
        currency: 'usd',
        unit_amount: Math.round(item.unitPrice * 100),
        product_data: {
          name: item.label,
          description: `${item.sizeLabel} · ${item.swatchName}`,
        },
      },
      quantity: item.qty,
    }))

    // Add the buyer-chosen shipping rate as its own line item so they pay
    // items + postage in one Stripe session. v1 = single rate for whole cart.
    if (shipping?.amount) {
      lineItems.push({
        price_data: {
          currency: (shipping.currency || 'usd').toLowerCase(),
          unit_amount: Math.round(parseFloat(shipping.amount) * 100),
          product_data: {
            name: 'Shipping',
            description: `${shipping.carrier ?? ''} ${shipping.service ?? ''}`.trim() || 'Shipping',
          },
        },
        quantity: 1,
      })
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: lineItems,
      success_url: successUrl ?? `${siteUrl}?checkout=success`,
      cancel_url:  cancelUrl  ?? `${siteUrl}?checkout=cancelled`,
      // Pass metadata so the webhook can record the order
      metadata: {
        items: JSON.stringify(items.map((i: { typeKey: string; label: string; sizeLabel: string; qty: number; unitPrice: number; sellerId?: string }) => ({
          typeKey: i.typeKey, label: i.label, sizeLabel: i.sizeLabel, qty: i.qty, unitPrice: i.unitPrice, sellerId: i.sellerId ?? null,
        }))),
        // Stripe metadata values must be strings; null skipped.
        ...(buyerMood ? { buyer_mood: String(buyerMood).slice(0, 60) } : {}),
        ...(buyerRoom ? { buyer_room_name: String(buyerRoom).slice(0, 100) } : {}),
        // Buyer-paid shipping summary — webhook stamps these on the order
        ...(shipping?.rateId   ? { shippo_rate_id:     String(shipping.rateId).slice(0, 100) } : {}),
        ...(shipping?.amount   ? { shipping_cost_cents: String(Math.round(parseFloat(shipping.amount) * 100)) } : {}),
        ...(shipping?.carrier  ? { shipping_carrier:    String(shipping.carrier).slice(0, 30) } : {}),
        ...(shipping?.service  ? { shipping_service:    String(shipping.service).slice(0, 60) } : {}),
        ...(address           ? { buyer_address:        JSON.stringify(address).slice(0, 500) } : {}),
      },
    })

    return new Response(JSON.stringify({ url: session.url, sessionId: session.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('[create-checkout]', err)
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
