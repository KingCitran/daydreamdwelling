-- ── Migration 006: Align seller app column names + add shop_url ───────────────
-- The seller app uses label/is_active/hex_color; 001 schema used name/status/hex.
-- Add the missing columns so the seller app works against the live DB.

-- products: add label (display name) and is_active (simple boolean vs status enum)
alter table public.products
  add column if not exists label      text,
  add column if not exists is_active  boolean not null default true,
  add column if not exists shop_url   text;

-- Back-fill label from name where set
update public.products set label = name where label is null and name is not null;

-- product_swatches: seller app uses hex_color, schema has hex
alter table public.product_swatches
  add column if not exists hex_color text;

-- Back-fill hex_color from hex where set
update public.product_swatches set hex_color = hex where hex_color is null and hex is not null;
