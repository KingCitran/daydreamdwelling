-- 051_escalation_tracking.sql
-- Track WHO escalated an order so we can stop sellers from wiping out
-- escalations they didn't create. Today only sellers escalate, but the
-- moment we add buyer- or admin-initiated escalations, the existing
-- seller_clear_escalation would let a seller make those vanish too.
--
-- Adds orders.escalated_by (the uid of whoever escalated), populated by
-- seller_escalate_order at escalation time. seller_clear_escalation now
-- requires the caller to be either the same person who escalated or an
-- admin.

alter table public.orders
  add column if not exists escalated_by uuid references auth.users(id) on delete set null;

-- Re-declare seller_escalate_order to stamp escalated_by alongside the
-- existing escalated_at / escalation_note.
create or replace function public.seller_escalate_order(p_order_id uuid, p_note text default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.order_items where order_id = p_order_id and seller_id = auth.uid()
  ) then
    raise exception 'Not authorized to escalate this order';
  end if;
  update public.orders set
    escalated_at    = coalesce(escalated_at, now()),
    escalation_note = p_note,
    escalated_by    = coalesce(escalated_by, auth.uid())
  where id = p_order_id;
end;
$$;

-- Re-declare seller_clear_escalation with the new authorization rule:
-- caller must be either the original escalator or an admin. A seller can
-- still freely clear escalations they themselves opened.
create or replace function public.seller_clear_escalation(p_order_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_escalated_by uuid;
begin
  if not exists (
    select 1 from public.order_items where order_id = p_order_id and seller_id = auth.uid()
  ) then
    raise exception 'Not authorized';
  end if;
  select escalated_by into v_escalated_by from public.orders where id = p_order_id;
  if v_escalated_by is not null
     and v_escalated_by <> auth.uid()
     and not public.is_admin()
  then
    raise exception 'Only the user who escalated this order (or an admin) can clear it';
  end if;
  update public.orders set
    escalated_at    = null,
    escalation_note = null,
    escalated_by    = null
  where id = p_order_id;
end;
$$;
