-- 058_product_custom_orders.sql
-- Custom order pipeline. Tracks the lifecycle of a customized/custom order
-- from customer submission through seller review to fulfillment.
--
-- Status pipeline:
--   Customized: draft → ordered → building → shipped → delivered
--   Custom:     pending_review → approved → ordered → building → shipped → delivered
--               pending_review → rejected (seller declines)

create table public.product_custom_orders (
  id              uuid primary key default gen_random_uuid(),
  product_id      uuid not null references public.products(id) on delete cascade,
  customer_id     uuid references auth.users(id) on delete set null,
  seller_id       uuid not null references public.profiles(id),
  badge_type      text not null check (badge_type in ('custom', 'customized')),
  spec            jsonb not null default '{}',
  base_price      numeric(10,2),
  custom_price    numeric(10,2),
  service_fee_pct numeric(4,2) not null default 3.5,
  service_fee_amt numeric(10,2),
  status          text not null default 'draft'
    check (status in ('draft', 'pending_review', 'approved', 'rejected', 'ordered', 'building', 'shipped', 'delivered')),
  seller_note     text,
  customer_note   text,
  model_3d_path   text,
  created_at      timestamptz not null default now(),
  reviewed_at     timestamptz,
  ordered_at      timestamptz
);

create index product_custom_orders_customer_idx
  on public.product_custom_orders (customer_id, created_at desc);
create index product_custom_orders_seller_idx
  on public.product_custom_orders (seller_id, status, created_at desc);
create index product_custom_orders_product_idx
  on public.product_custom_orders (product_id);

alter table public.product_custom_orders enable row level security;

-- Customers can create and read their own custom orders
create policy "customers_manage_own_custom_orders"
  on public.product_custom_orders for all
  using (auth.uid() = customer_id)
  with check (auth.uid() = customer_id);

-- Sellers can read and update custom orders for their products
create policy "sellers_read_own_custom_orders"
  on public.product_custom_orders for select
  using (auth.uid() = seller_id);

create policy "sellers_update_own_custom_orders"
  on public.product_custom_orders for update
  using (auth.uid() = seller_id);

-- Admins can see everything
create policy "admins_read_all_custom_orders"
  on public.product_custom_orders for select
  using (public.is_admin());
