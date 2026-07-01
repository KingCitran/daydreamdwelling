// Supabase Edge Function — flip an order_item's fulfillment_status to
// 'delivered' AND fire the buyer's "It made it." email in a single call.
//
// Why this exists as its own function instead of a direct UPDATE from the
// seller dashboard: multiple paths used to (or could) set delivered status
// — seller-marked, buyer-marked (since removed), future carrier webhook —
// and we want exactly one place that owns the side effect of firing the
// delivery email. The seller's OrdersPage now invokes this function on
// "Mark Delivered" instead of writing the column directly.
//
// Authorization: caller must be the seller on the order_item. Caller-
// scoped client (forwarded JWT) — RLS on order_items already enforces
// seller_id = auth.uid() for updates (migration 034), so a malicious
// caller targeting another seller's item gets PGRST116 / 0 rows updated.
//
// Deploy: supabase functions deploy mark-delivered
// Env: SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2?target=deno'
import { sendEmail, deliveryConfirmationEmail } from '../_shared/emails.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { orderItemId } = await req.json()
    if (!orderItemId) return json({ error: 'Missing orderItemId' }, 400)

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return json({ error: 'Missing auth' }, 401)

    const callerClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } },
    )
    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const { data: userData } = await callerClient.auth.getUser()
    const callerId = userData?.user?.id
    if (!callerId) return json({ error: 'Auth failed' }, 401)

    // L1: Check if already delivered — skip email on duplicate calls
    const { data: existing } = await callerClient
      .from('order_items')
      .select('fulfillment_status')
      .eq('id', orderItemId)
      .single()
    const alreadyDelivered = existing?.fulfillment_status === 'delivered'

    // Caller-scoped update — RLS allows it only if seller_id = auth.uid().
    const { data: updated, error: updateErr } = await callerClient
      .from('order_items')
      .update({ fulfillment_status: 'delivered' })
      .eq('id', orderItemId)
      .select('id, product_name, products(label), order_id')
      .single()
    if (updateErr || !updated) {
      return json({ error: 'Not authorized to mark this item delivered, or item not found' }, 403)
    }

    // Look up the buyer's email + the seller's display name for the email.
    // Admin client because the order row + sellers profile may not be
    // visible to the seller via RLS.
    const { data: order } = await adminClient
      .from('orders')
      .select('shipping_address, guest_email, user_id')
      .eq('id', updated.order_id)
      .single()
    const { data: seller } = await adminClient
      .from('profiles')
      .select('display_name')
      .eq('id', callerId)
      .single()

    const shipAddr = order?.shipping_address as Record<string, unknown> | null
    const shipAddrEmail = typeof shipAddr?.email === 'string' ? shipAddr.email : null
    let buyerEmail: string | null = shipAddrEmail || order?.guest_email || null
    if (!buyerEmail && order?.user_id) {
      const { data: u } = await adminClient.auth.admin.getUserById(order.user_id)
      buyerEmail = u?.user?.email ?? null
    }

    // Only send email if this is the FIRST time marking delivered
    if (buyerEmail && !alreadyDelivered) {
      const productDisplayLabel = updated.product_name || updated.products?.label || 'your order'
      const { subject, html } = deliveryConfirmationEmail({
        itemLabel:  productDisplayLabel,
        sellerName: seller?.display_name ?? null,
      })
      await sendEmail({ to: buyerEmail, subject, html })
    }

    return json({ ok: true, orderItemId: updated.id })
  } catch (err) {
    console.error('[mark-delivered]', err)
    return json({ error: (err as Error).message }, 500)
  }
})

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}
