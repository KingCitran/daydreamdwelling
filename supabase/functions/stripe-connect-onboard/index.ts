// Supabase Edge Function — start (or resume) Stripe Express onboarding for
// a seller. Creates an Express account on first call, then returns a fresh
// account-link URL that the seller follows to complete KYC + bank details.
//
// Flow:
//   1. Seller hits "Get paid" → frontend POSTs here.
//   2. We look at profiles.stripe_account_id. If null, we call
//      stripe.accounts.create({type:'express', ...}) and stamp it.
//   3. We call stripe.accountLinks.create(...) to get a one-time onboarding
//      URL and return it.
//   4. Frontend redirects the seller to that URL.
//   5. When the seller finishes, Stripe redirects to ?stripe=return on the
//      seller's settings page → the frontend then calls
//      stripe-connect-refresh to update status flags.
//
// Deploy: supabase functions deploy stripe-connect-onboard
// Env vars: STRIPE_SECRET_KEY, SUPABASE_URL, SUPABASE_ANON_KEY, SITE_URL

import Stripe from 'https://esm.sh/stripe@14?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2?target=deno'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2024-04-10',
  httpClient: Stripe.createFetchHttpClient(),
})

const corsHeaders = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return json({ error: 'Missing auth' }, 401)

    const callerClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } },
    )
    const { data: userData } = await callerClient.auth.getUser()
    const caller = userData?.user
    if (!caller) return json({ error: 'Auth failed' }, 401)

    // Fetch existing profile (RLS lets the caller read their own row).
    const { data: profile, error: pErr } = await callerClient
      .from('profiles')
      .select('id, stripe_account_id, display_name')
      .eq('id', caller.id)
      .single()
    if (pErr || !profile) return json({ error: 'Profile not found' }, 404)

    let accountId = profile.stripe_account_id as string | null

    if (!accountId) {
      const account = await stripe.accounts.create({
        type: 'express',
        email: caller.email ?? undefined,
        metadata: { seller_id: caller.id, display_name: profile.display_name ?? '' },
        capabilities: {
          card_payments: { requested: true },
          transfers:     { requested: true },
        },
      })
      accountId = account.id
      // Stamp via SECURITY DEFINER RPC (caller-scoped, only writes own row).
      const { error: stampErr } = await callerClient.rpc('stamp_stripe_account_id', { p_account_id: accountId })
      if (stampErr) {
        console.error('[stripe-connect-onboard] stamp failed:', stampErr, 'acct:', accountId)
        return json({ error: `Stripe account ${accountId} created but DB stamp failed: ${stampErr.message}` }, 500)
      }
    }

    // Return URL has to be the SELLER app's origin, never SITE_URL (which is
    // wired to the customer site daydreamdwelling.com for create-checkout).
    // Caller passes their own window.location.origin so dev/preview/prod all
    // work without ceremony; we fall back to daydreamsellers.com production.
    const requestBody = await req.json().catch(() => ({} as Record<string, unknown>))
    const callerOrigin = typeof requestBody?.returnOrigin === 'string' ? requestBody.returnOrigin : null
    const sellerOrigin = callerOrigin || 'https://daydreamsellers.com'
    const accountLink = await stripe.accountLinks.create({
      account:     accountId,
      refresh_url: `${sellerOrigin}/settings?stripe=refresh`,
      return_url:  `${sellerOrigin}/settings?stripe=return`,
      type:        'account_onboarding',
    })

    return json({ url: accountLink.url, accountId })
  } catch (err) {
    console.error('[stripe-connect-onboard]', err)
    return json({ error: (err as Error).message }, 500)
  }
})

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}
