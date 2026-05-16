-- 026_product_physical.sql
-- Physical attributes on products: dimensions + weight + material + finish.
-- Powers BOTH shipping rate calculation AND Tripo3D model scaling/material so
-- sellers fill these in once and both flows work. No "free shipping" defaults —
-- weight/dimensions are required for any active product (enforced in app layer;
-- DB allows null for drafts).

alter table public.products
  add column if not exists weight_oz       int,
  add column if not exists length_in       numeric(6,2),
  add column if not exists width_in        numeric(6,2),
  add column if not exists height_in       numeric(6,2),
  add column if not exists primary_material text,
  add column if not exists surface_finish   text check (surface_finish in (
    'matte', 'glossy', 'satin', 'textured', 'wood', 'metal', 'fabric', 'leather', 'glass', 'ceramic', 'mixed'
  ));
