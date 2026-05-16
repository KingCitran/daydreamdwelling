-- 027_pickup_options.sql
-- Local pickup options on products. When a buyer is within range of the
-- pickup address, the storefront offers pickup at checkout (no shipping fee).

alter table public.products
  add column if not exists pickup_available    boolean not null default false,
  add column if not exists pickup_address      jsonb,
  add column if not exists pickup_instructions text;
