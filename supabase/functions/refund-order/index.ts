// Supabase Edge Function — issues a Stripe refund for a seller-initiated
// cancellation/return. Validates the caller is a seller on the order,
// looks up the original PaymentIntent, calls stripe.refunds.create, then
// stamps the orders row via the SECURITY DEFINER stamp RPC.
//
// Deploy: supabase functions deploy refund-order
// Env vars needed:
//   STRIPE_SECRET_KEY
//   SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY  (for the order lookup; the stamp itself runs
//                               as the caller via forwarded JWT)
//
// Request body: { orderId: string, reason?: string }
// Response: { refundId, amountCents } on success, { error } on failure.

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
    const { orderId, reason } = await req.json()
    if (!orderId) {
      return json({ error: 'Missing orderId' }, 400)
    }

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return json({ error: 'Missing auth' }, 401)

    // Caller-scoped client for the final stamp (gates on auth.uid()).
    const callerClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } },
    )
    // Service-role client for the order lookup (need to read row regardless
    // of buyer-scoped RLS on orders).
    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const { data: order, error: lookupErr } = await adminClient
      .from('orders')
      .select('id, status, total_cents, stripe_payment_id, refunded_at')
      .eq('id', orderId)
      .single()
    if (lookupErr || !order) {
      return json({ error: 'Order not found' }, 404)
    }
    if (order.refunded_at || order.status === 'refunded') {
      return json({ error: 'Already refunded' }, 400)
    }
    if (!order.stripe_payment_id) {
      return json({ error: 'No Stripe payment on this order — refund manually' }, 400)
    }

    // AUTH GATE — must come before stripe.refunds.create. Anyone with a JWT
    // can hit this endpoint, so without this check a malicious caller could
    // trigger a real Stripe refund on someone else's order. We verify the
    // caller is a seller on the order via the caller-scoped client (RLS will
    // only return order_items rows where seller_id = auth.uid()).
    const { data: callerUser } = await callerClient.auth.getUser()
    const callerId = callerUser?.user?.id
    if (!callerId) return json({ error: 'Auth failed' }, 401)

    const { data: ownedItems, error: ownErr } = await callerClient
      .from('order_items')
      .select('id')
      .eq('order_id', orderId)
      .eq('seller_id', callerId)
      .limit(1)
    if (ownErr) {
      console.error('[refund-order] ownership check failed:', ownErr)
      return json({ error: 'Authorization check failed' }, 500)
    }
    if (!ownedItems?.length) {
      return json({ error: 'Not authorized to refund this order' }, 403)
    }

    // Issue the refund. Full amount = total_cents.
    const refund = await stripe.refunds.create({
      payment_intent: order.stripe_payment_id,
      reason: 'requested_by_customer',
      metadata: { order_id: orderId, seller_reason: reason ?? '' },
    })

    // Stamp the order — RPC re-checks order_items.seller_id = auth.uid() as
    // defense in depth, but the gate above is the primary authorization.
    const { error: stampErr } = await callerClient.rpc('stamp_order_refunded', {
      p_order_id: orderId,
      p_amount_cents: order.total_cents,
      p_stripe_refund_id: refund.id,
      p_reason: reason ?? null,
    })
    if (stampErr) {
      // Refund went through at Stripe but DB didn't update — surface this so
      // admin can reconcile. Don't auto-reverse the Stripe refund.
      console.error('[refund-order] stamp failed after Stripe refund:', stampErr, 'refund:', refund.id)
      return json({ error: `Stripe refund ${refund.id} succeeded but DB stamp failed: ${stampErr.message}` }, 500)
    }

    return json({ refundId: refund.id, amountCents: order.total_cents })
  } catch (err) {
    console.error('[refund-order]', err)
    return json({ error: (err as Error).message }, 500)
  }
})

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}
