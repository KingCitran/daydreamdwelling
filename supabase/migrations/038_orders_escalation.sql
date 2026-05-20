-- 038_orders_escalation.sql
-- Sellers can flag orders that need admin attention (e.g. damaged stock,
-- shipping address looks fishy, buyer-asked-to-change-something) and can
-- cancel outright when a fulfillment can't proceed.
--
-- Cancellation re-uses the existing orders.status='cancelled' (already in
-- the check constraint from migration 001) — these columns just attach
-- context (timestamp + reason) so the dashboard can show *why*.

alter table public.orders
  add column if not exists escalated_at        timestamptz,
  add column if not exists escalation_note     text,
  add column if not exists cancelled_at        timestamptz,
  add column if not exists cancellation_reason text;

-- Sellers don't have an UPDATE policy on orders (only buyers see their own
-- rows, sellers can SELECT via 033). Rather than open up the whole row to
-- seller writes (status, total_cents, stripe_payment_id, etc. would all be
-- exposed), expose two SECURITY DEFINER RPCs that authorize on order_items
-- ownership and touch only the columns we want sellers to touch.

create or replace function public.seller_cancel_order(p_order_id uuid, p_reason text default null)
returns void
language plpgsql
security definer
as $$
begin
  if not exists (
    select 1 from public.order_items where order_id = p_order_id and seller_id = auth.uid()
  ) then
    raise exception 'Not authorized to cancel this order';
  end if;
  update public.orders set
    status              = 'cancelled',
    cancelled_at        = coalesce(cancelled_at, now()),
    cancellation_reason = p_reason
  where id = p_order_id;
end;
$$;

create or replace function public.seller_escalate_order(p_order_id uuid, p_note text default null)
returns void
language plpgsql
security definer
as $$
begin
  if not exists (
    select 1 from public.order_items where order_id = p_order_id and seller_id = auth.uid()
  ) then
    raise exception 'Not authorized to escalate this order';
  end if;
  update public.orders set
    escalated_at    = coalesce(escalated_at, now()),
    escalation_note = p_note
  where id = p_order_id;
end;
$$;

create or replace function public.seller_clear_escalation(p_order_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  if not exists (
    select 1 from public.order_items where order_id = p_order_id and seller_id = auth.uid()
  ) then
    raise exception 'Not authorized';
  end if;
  update public.orders set escalated_at = null, escalation_note = null where id = p_order_id;
end;
$$;

revoke all on function public.seller_cancel_order(uuid, text) from public;
revoke all on function public.seller_escalate_order(uuid, text) from public;
revoke all on function public.seller_clear_escalation(uuid) from public;
grant execute on function public.seller_cancel_order(uuid, text) to authenticated;
grant execute on function public.seller_escalate_order(uuid, text) to authenticated;
grant execute on function public.seller_clear_escalation(uuid) to authenticated;
