-- 024_order_fulfillment_columns.sql
-- Add the columns OrdersPage has been querying that didn't exist in the schema:
-- - quantity / unit_price (denormalized friendlier names alongside qty/unit_price_cents)
-- - size_label / swatch_name (snapshot at purchase time)
-- - fulfillment_status / tracking_number (post-purchase workflow)
-- - created_at (row-level timestamp for sorting individual items)
--
-- Idempotent (IF NOT EXISTS) so it's safe to re-run.

alter table public.order_items
  add column if not exists quantity           int,
  add column if not exists unit_price         numeric(10,2),
  add column if not exists size_label         text,
  add column if not exists swatch_name        text,
  add column if not exists fulfillment_status text check (fulfillment_status in ('packed', 'shipped', 'delivered')),
  add column if not exists tracking_number    text,
  add column if not exists created_at         timestamptz not null default now();

-- Backfill the friendlier columns from the existing ones for any rows that
-- predate this migration.
update public.order_items
   set quantity = qty
 where quantity is null and qty is not null;

update public.order_items
   set unit_price = (unit_price_cents::numeric / 100.0)
 where unit_price is null and unit_price_cents is not null;
