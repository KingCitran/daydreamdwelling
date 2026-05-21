-- 040_shipping_labels.sql
-- Shippo integration: seller ship-from address (lives on their profile) +
-- label metadata on order_items so we can show the seller a Download Label
-- link after purchase and link Shippo's tracking webhook back to the row.

alter table public.profiles
  add column if not exists ship_from_name       text,
  add column if not exists ship_from_company    text,
  add column if not exists ship_from_street1    text,
  add column if not exists ship_from_street2    text,
  add column if not exists ship_from_city       text,
  add column if not exists ship_from_state      text,
  add column if not exists ship_from_zip        text,
  add column if not exists ship_from_country    text default 'US',
  add column if not exists ship_from_phone      text,
  add column if not exists ship_from_email      text;

alter table public.order_items
  add column if not exists shippo_transaction_id text,
  add column if not exists label_url             text,
  add column if not exists label_purchased_at    timestamptz,
  add column if not exists shipping_cost_cents   int,
  add column if not exists shipping_carrier      text,
  add column if not exists shipping_service      text;

-- Index for Shippo's tracking webhook to look up an order_item by tracking
-- number (it sends events keyed on tracking_number).
create index if not exists idx_order_items_tracking on public.order_items (tracking_number)
  where tracking_number is not null;

-- SECURITY DEFINER stamp RPC: the create-shipping-label edge function calls
-- this after a successful Shippo label purchase. Gates on order_items
-- ownership so an attacker can't write tracking info to other sellers' items.
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
as $$
begin
  if not exists (
    select 1 from public.order_items where id = p_item_id and seller_id = auth.uid()
  ) then
    raise exception 'Not authorized to label this order item';
  end if;
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

revoke all on function public.stamp_order_item_label(uuid, text, text, text, int, text, text) from public;
grant execute on function public.stamp_order_item_label(uuid, text, text, text, int, text, text) to authenticated;
