-- 045_lock_shipping_columns.sql
-- Defense-in-depth: lock the three "Shippo bought this label" columns
-- (label_url, shippo_transaction_id, label_purchased_at) so a seller can't
-- forge them via a direct UPDATE to claim a label they never paid for.
-- Without this guard, migration 034's seller UPDATE policy on order_items
-- implicitly grants writes to all columns (RLS has no column-level scope),
-- meaning a malicious seller could paste fake values, mark the item
-- shipped, take payment, and never ship — leaving the platform on the
-- hook for the chargeback with no Shippo receipt as evidence.
--
-- We intentionally do NOT lock tracking_number, shipping_carrier,
-- shipping_service, or shipping_cost_cents — sellers legitimately enter
-- those for items shipped outside the platform's Shippo integration
-- (e.g. UPS direct, pre-existing pickup arrangements). Those fields are
-- informational; the label_url/shippo_transaction_id pair is the
-- authoritative "platform bought this label" attestation.
--
-- The only path that can change the locked columns is the SECURITY
-- DEFINER `stamp_order_item_label` RPC, which sets a transaction-local
-- bypass flag before its UPDATE. Postgres clears the flag at end of
-- transaction. Direct seller UPDATEs never set the flag.

create or replace function public.guard_order_item_shipping_columns()
returns trigger language plpgsql as $$
begin
  -- Bypass flag set transaction-locally by stamp_order_item_label below.
  -- current_setting(..., true) returns NULL if the GUC isn't set; we
  -- accept 'on' or 'true' as the affirmative value.
  if coalesce(current_setting('app.allow_shipping_columns', true), '') in ('on', 'true', '1') then
    return new;
  end if;

  -- Admins bypass too (refund/dispute reconciliation workflows).
  if public.is_admin() then
    return new;
  end if;

  if new.label_url             is distinct from old.label_url
  or new.shippo_transaction_id is distinct from old.shippo_transaction_id
  or new.label_purchased_at    is distinct from old.label_purchased_at
  then
    raise exception 'label_url / shippo_transaction_id / label_purchased_at can only be set via stamp_order_item_label (buy a real label via Shippo)';
  end if;

  return new;
end;
$$;

drop trigger if exists order_items_guard_shipping on public.order_items;
create trigger order_items_guard_shipping
  before update on public.order_items
  for each row execute function public.guard_order_item_shipping_columns();

-- Re-declare stamp_order_item_label so it sets the bypass flag before its
-- UPDATE. Everything else identical to migration 040.
create or replace function public.stamp_order_item_label(
  p_item_id      uuid,
  p_tracking     text,
  p_label_url    text,
  p_shippo_tx_id text,
  p_cost_cents   int,
  p_carrier      text,
  p_service      text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.order_items where id = p_item_id and seller_id = auth.uid()
  ) then
    raise exception 'Not authorized to label this order item';
  end if;
  -- Transaction-local bypass for the column guard above. Auto-clears at
  -- end of this RPC's implicit transaction.
  perform set_config('app.allow_shipping_columns', 'on', true);
  update public.order_items set
    tracking_number       = p_tracking,
    label_url             = p_label_url,
    shippo_transaction_id = p_shippo_tx_id,
    shipping_cost_cents   = p_cost_cents,
    shipping_carrier      = p_carrier,
    shipping_service      = p_service,
    label_purchased_at    = coalesce(label_purchased_at, now()),
    fulfillment_status    = 'shipped'
  where id = p_item_id;
end;
$$;
