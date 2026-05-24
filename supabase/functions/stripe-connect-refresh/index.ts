// Supabase Edge Function — pull current Stripe Connect account status and
// write it back to profiles. Called by the frontend when:
//   - the seller returns from Stripe's hosted onboarding (?stripe=return)
//   - the seller manually clicks "Refresh status" on their Settings page
//   - the Earnings page mounts and the status is stale
//
// Returns the same flags it writes so the frontend can render immediately
// without a second DB round-trip.
//
// Deploy: supabase functions deploy stripe-connect-refresh
// Env vars: STRIPE_SECRET_KEY, SUPABASE_URL, SUPABASE_ANON_KEY

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

    const { data: profile } = await callerClient
      .from('profiles')
      .select('stripe_account_id')
      .eq('id', caller.id)
      .single()
    const accountId = profile?.stripe_account_id as string | null
    if (!accountId) {
      return json({
        connected:         false,
        chargesEnabled:    false,
        payoutsEnabled:    false,
        detailsSubmitted:  false,
      })
    }

    const account = await stripe.accounts.retrieve(accountId)
    const flags = {
      chargesEnabled:    Boolean(account.charges_enabled),
      payoutsEnabled:    Boolean(account.payouts_enabled),
      detailsSubmitted:  Boolean(account.details_submitted),
    }

    const { error: stampErr } = await callerClient.rpc('set_stripe_account_status', {
      p_charges_enabled:   flags.chargesEnabled,
      p_payouts_enabled:   flags.payoutsEnabled,
      p_details_submitted: flags.detailsSubmitted,
    })
    if (stampErr) {
      console.error('[stripe-connect-refresh] stamp failed:', stampErr)
    }

    return json({ connected: true, accountId, ...flags })
  } catch (err) {
    console.error('[stripe-connect-refresh]', err)
    return json({ error: (err as Error).message }, 500)
  }
})

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}
