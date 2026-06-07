-- 057_product_customization.sql
-- Customizable product system. Two tiers:
--   "Customized" = small tweaks to existing product (add to cart directly)
--   "Custom" = fully bespoke commission (requires seller approval)
--
-- Sellers define customization options per product using a form builder.
-- Each option has a type (dimension, dropdown, number, material, color,
-- text, photo) and type-specific config (min/max/choices/price rules).

-- ── Products table: customization columns ──────────────────────────

alter table public.products
  add column if not exists is_customizable     boolean not null default false,
  add column if not exists customization_type  text check (customization_type in ('customized', 'custom', 'both')),
  add column if not exists fulfillment_method  text check (fulfillment_method in ('ships_finished', 'diy_kit', 'local_pickup', 'local_builder'));

-- ── Customization options ──────────────────────────────────────────

create table public.product_customization_options (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references public.products(id) on delete cascade,
  option_type text not null check (option_type in ('dimension', 'material', 'color', 'feature', 'number', 'text', 'photo')),
  label       text not null,
  input_type  text not null check (input_type in ('range', 'dropdown', 'number', 'text', 'color', 'photo')),
  config      jsonb not null default '{}',
  sort_order  int not null default 0,
  required    boolean not null default true,
  created_at  timestamptz not null default now()
);

create index product_customization_options_product_idx
  on public.product_customization_options (product_id, sort_order);

alter table public.product_customization_options enable row level security;

-- Sellers manage their own product's options
create policy "sellers_manage_own_customization_options"
  on public.product_customization_options for all
  using (
    exists (
      select 1 from public.products p
      where p.id = product_customization_options.product_id
        and p.seller_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.products p
      where p.id = product_customization_options.product_id
        and p.seller_id = auth.uid()
    )
  );

-- Anyone can read customization options (customers need them to configure)
create policy "public_read_customization_options"
  on public.product_customization_options for select
  using (true);
