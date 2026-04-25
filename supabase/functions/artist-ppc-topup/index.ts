// Supabase Edge Function — creates a Stripe Checkout Session for an artist
// PPC balance top-up. The webhook (stripe-webhook) credits the artist's
// ppc_balance_cents when checkout.session.completed fires with metadata.purpose
// === 'artist_ppc_topup'.
// Deploy: supabase functions deploy artist-ppc-topup
// Env vars: STRIPE_SECRET_KEY, SITE_URL

import Stripe from 'https://esm.sh/stripe@14?target=deno'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2024-04-10',
  httpClient: Stripe.createFetchHttpClient(),
})

const corsHeaders = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Allowed top-up packs — protects against client tampering
const PACKS: Record<string, { cents: number; label: string }> = {
  '10':  { cents: 1000, label: '$10 PPC top-up' },
  '25':  { cents: 2500, label: '$25 PPC top-up' },
  '50':  { cents: 5000, label: '$50 PPC top-up' },
  '100': { cents: 10000, label: '$100 PPC top-up' },
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { pack, artistId, successUrl, cancelUrl } = await req.json()

    const selected = PACKS[String(pack)]
    if (!selected) {
      return new Response(JSON.stringify({ error: 'Invalid pack' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    if (!artistId) {
      return new Response(JSON.stringify({ error: 'Missing artistId' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const siteUrl = Deno.env.get('SITE_URL') ?? 'http://localhost:5173'

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [{
        price_data: {
          currency: 'usd',
          unit_amount: selected.cents,
          product_data: {
            name: selected.label,
            description: 'Pre-paid balance for click-through links from your tracks. Funds your reach.',
          },
        },
        quantity: 1,
      }],
      success_url: successUrl ?? `${siteUrl}/community/artists/dashboard?topup=success`,
      cancel_url:  cancelUrl  ?? `${siteUrl}/community/artists/programs?topup=cancelled`,
      metadata: {
        purpose:        'artist_ppc_topup',
        artist_id:      artistId,
        credit_cents:   String(selected.cents),
      },
    })

    return new Response(JSON.stringify({ url: session.url, sessionId: session.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('[artist-ppc-topup]', err)
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
