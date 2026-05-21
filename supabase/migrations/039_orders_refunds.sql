-- 039_orders_refunds.sql
-- Track Stripe refunds initiated by sellers. v1 supports full-order
-- refunds only; partial-amount and per-item refunds can layer on later.
--
-- The actual stripe.refunds.create call lives in the refund-order edge
-- function (uses STRIPE_SECRET_KEY). This migration just adds the columns
-- + a SECURITY DEFINER stamp RPC that the edge function calls after a
-- successful refund.

alter table public.orders
  add column if not exists refunded_at        timestamptz,
  add column if not exists refund_amount_cents int,
  add column if not exists stripe_refund_id   text,
  add column if not exists refund_reason      text;

-- Update the status check constraint to allow 'refunded' (was already in
-- the original from 001_initial_schema.sql — verifying via re-declare).
-- Safe to no-op if already present.

-- Stamp function: the edge function calls this after Stripe confirms the
-- refund. Same security-definer + caller-ownership pattern as the cancel
-- and escalate RPCs from 038.
create or replace function public.stamp_order_refunded(
  p_order_id          uuid,
  p_amount_cents      int,
  p_stripe_refund_id  text,
  p_reason            text default null
)
returns void
language plpgsql
security definer
as $$
begin
  -- Authorization: only sellers on this order can stamp it. The edge
  -- function itself runs with the service role key for the Stripe call,
  -- but it forwards the caller's JWT and we re-check auth.uid() here.
  if not exists (
    select 1 from public.order_items where order_id = p_order_id and seller_id = auth.uid()
  ) then
    raise exception 'Not authorized to refund this order';
  end if;
  update public.orders set
    status              = 'refunded',
    refunded_at         = coalesce(refunded_at, now()),
    refund_amount_cents = p_amount_cents,
    stripe_refund_id    = p_stripe_refund_id,
    refund_reason       = p_reason
  where id = p_order_id;
end;
$$;

revoke all on function public.stamp_order_refunded(uuid, int, text, text) from public;
grant execute on function public.stamp_order_refunded(uuid, int, text, text) to authenticated;
