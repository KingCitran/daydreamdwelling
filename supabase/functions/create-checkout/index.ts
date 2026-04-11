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
    const { items, successUrl, cancelUrl } = await req.json()
    // items: [{ typeKey, label, sizeLabel, swatchName, unitPrice, qty }]

    if (!items?.length) {
      return new Response(JSON.stringify({ error: 'No items provided' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const siteUrl = Deno.env.get('SITE_URL') ?? 'http://localhost:5173'

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: items.map((item: { label: string; sizeLabel: string; swatchName: string; unitPrice: number; qty: number }) => ({
        price_data: {
          currency: 'usd',
          unit_amount: Math.round(item.unitPrice * 100), // cents
          product_data: {
            name: item.label,
            description: `${item.sizeLabel} · ${item.swatchName}`,
          },
        },
        quantity: item.qty,
      })),
      success_url: successUrl ?? `${siteUrl}?checkout=success`,
      cancel_url:  cancelUrl  ?? `${siteUrl}?checkout=cancelled`,
      // Pass metadata so the webhook can record the order
      metadata: {
        items: JSON.stringify(items.map((i: { typeKey: string; label: string; sizeLabel: string; qty: number; unitPrice: number; sellerId?: string }) => ({
          typeKey: i.typeKey, label: i.label, sizeLabel: i.sizeLabel, qty: i.qty, unitPrice: i.unitPrice, sellerId: i.sellerId ?? null,
        }))),
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
