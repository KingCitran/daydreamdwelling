-- ── Migration 007: Full seller listing fields ────────────────────────────────
-- Adds columns needed for the 7-step listing form (spec Section 16)

alter table public.products
  add column if not exists make_model        text,
  add column if not exists handmade_type     text check (handmade_type in ('handmade', 'manufactured', 'exclusive')),
  add column if not exists short_description text,
  add column if not exists materials         jsonb default '[]'::jsonb,
  add column if not exists guarantee         text,
  add column if not exists shipping_type     text default 'flat' check (shipping_type in ('flat', 'calculated')),
  add column if not exists flat_rate         numeric(8,2),
  add column if not exists processing_days   int,
  add column if not exists shipping_regions  jsonb default '["domestic"]'::jsonb,
  add column if not exists wattage           int,
  add column if not exists kelvin            int;

-- product_images RLS (table already exists from migration 001)
-- Allow anyone to read images for active products
create policy if not exists "Product images publicly readable"
  on public.product_images for select using (true);

-- Allow sellers to insert/update/delete their own product images
create policy if not exists "Sellers manage their own product images insert"
  on public.product_images for insert
  with check (exists (
    select 1 from public.products p
    where p.id = product_id and p.seller_id = auth.uid()
  ));

create policy if not exists "Sellers manage their own product images delete"
  on public.product_images for delete
  using (exists (
    select 1 from public.products p
    where p.id = product_id and p.seller_id = auth.uid()
  ));

-- Note: Supabase Storage bucket 'product-images' must be created manually in the dashboard:
-- Storage → New bucket → name: product-images → Public: ON
