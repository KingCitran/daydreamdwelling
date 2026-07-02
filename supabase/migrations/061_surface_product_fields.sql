-- 061: Surface product fields — texture type, paint finish, coverage, subcategory
-- Supports the new texture rendering system in the room builder.
-- Flooring, wall treatments, and paint products now carry metadata
-- that tells the builder HOW to render them (wood grain vs tile grid vs carpet weave).

-- Subcategory for finer classification (e.g. flooring → Hardwood, Carpet, Tile)
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS subcategory text;

-- Texture type determines the procedural pattern in the 3D builder
-- Values: wood, tile, carpet, concrete, marble, brick, shiplap, flat (or null)
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS texture_type text;

-- Paint finish determines wall roughness/sheen in the builder
-- Values: flat, eggshell, satin, semiGloss, highGloss (or null)
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS paint_finish text;

-- How many sq ft one unit/gallon/roll covers — helps buyers calculate quantity
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS coverage_sqft numeric(10,2);

-- Index for filtering surface products
CREATE INDEX IF NOT EXISTS idx_products_surface_type
  ON public.products (category, subcategory)
  WHERE is_floor_finish = true OR is_wall_finish = true;
