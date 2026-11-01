-- Auto-generated demo product seed
-- Assigns all items to the owner's seller account


-- 1. Sofa (sofa)
INSERT INTO products (
  seller_id, type_key, name, label, brand, description, category, subcategory,
  status, price, price_max, rating, review_count, guarantee, is_active,
  shipping_type, weight_oz, length_in, width_in, height_in,
  primary_material, processing_days
) VALUES (
  'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9', 'sofa', 'Sofa', 'Sofa', 'Forma Studio',
  'A low-profile sofa with solid hardwood legs and premium woven fabric cushions. Clean lines meet everyday comfort.', 'Seating', 'Sofas',
  'active', 699, 1299, 4.3, 142,
  '10-year frame · 2-year fabric', true,
  'calculated', 86, 36, 24, 18,
  'Solid hardwood frame', 3
);
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, '2-Seater', 699, 0
  FROM products WHERE type_key = 'sofa' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, '3-Seater', 899, 1
  FROM products WHERE type_key = 'sofa' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, 'Sectional', 1299, 2
  FROM products WHERE type_key = 'sofa' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Charcoal', '#4a4a4a', 0
  FROM products WHERE type_key = 'sofa' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Sand', '#c4a882', 1
  FROM products WHERE type_key = 'sofa' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Navy', '#1e3a5f', 2
  FROM products WHERE type_key = 'sofa' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';


-- 2. Loveseat (loveseat)
INSERT INTO products (
  seller_id, type_key, name, label, brand, description, category, subcategory,
  status, price, price_max, rating, review_count, guarantee, is_active,
  shipping_type, weight_oz, length_in, width_in, height_in,
  primary_material, processing_days
) VALUES (
  'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9', 'loveseat', 'Loveseat', 'Loveseat', 'Forma Studio',
  'A two-seat sofa perfect for smaller living spaces. Same comfort as the full sofa in a compact footprint.', 'Seating', 'Sofas',
  'active', 549, 799, 4.5, 87,
  '10-year frame · 2-year fabric', true,
  'calculated', 71, 24, 24, 18,
  'Kiln-dried hardwood frame', 3
);
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, 'Compact', 549, 0
  FROM products WHERE type_key = 'loveseat' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, 'Standard', 799, 1
  FROM products WHERE type_key = 'loveseat' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Biscuit', '#c8a888', 0
  FROM products WHERE type_key = 'loveseat' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Slate Blue', '#5a6a88', 1
  FROM products WHERE type_key = 'loveseat' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Forest', '#4a6a4a', 2
  FROM products WHERE type_key = 'loveseat' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';


-- 3. Accent Chair (chair)
INSERT INTO products (
  seller_id, type_key, name, label, brand, description, category, subcategory,
  status, price, price_max, rating, review_count, guarantee, is_active,
  shipping_type, weight_oz, length_in, width_in, height_in,
  primary_material, processing_days
) VALUES (
  'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9', 'chair', 'Accent Chair', 'Accent Chair', 'Form & Sit',
  'A versatile accent chair that works in any room. Sturdy steel frame with memory foam seat.', 'Seating', 'Accent Chairs',
  'active', 249, 449, 4.6, 88,
  '5-year frame · 1-year fabric', true,
  'calculated', 41, 12, 12, 18,
  'Powder-coated steel frame', 3
);
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, 'Accent', 249, 0
  FROM products WHERE type_key = 'chair' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, 'Armchair', 449, 1
  FROM products WHERE type_key = 'chair' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Sage', '#7a9e7e', 0
  FROM products WHERE type_key = 'chair' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Terracotta', '#c4785a', 1
  FROM products WHERE type_key = 'chair' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Slate', '#6a7a8a', 2
  FROM products WHERE type_key = 'chair' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';


-- 4. Bouclé Chair (boucleChair)
INSERT INTO products (
  seller_id, type_key, name, label, brand, description, category, subcategory,
  status, price, price_max, rating, review_count, guarantee, is_active,
  shipping_type, weight_oz, length_in, width_in, height_in,
  primary_material, processing_days
) VALUES (
  'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9', 'boucleChair', 'Bouclé Chair', 'Bouclé Chair', 'The Cozy Co',
  'The chair everyone is talking about. Plush bouclé texture with a solid wood base — effortlessly elevated.', 'Seating', 'Accent Chairs',
  'active', 389, 389, 4.8, 204,
  '3-year warranty', true,
  'calculated', 55, 12, 12, 18,
  'Solid beech wood legs', 3
);
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, 'Standard', 389, 0
  FROM products WHERE type_key = 'boucleChair' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Ivory', '#e8e0d0', 0
  FROM products WHERE type_key = 'boucleChair' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Caramel', '#c8a060', 1
  FROM products WHERE type_key = 'boucleChair' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Midnight', '#2a2a3a', 2
  FROM products WHERE type_key = 'boucleChair' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';


-- 5. Recliner (recliner)
INSERT INTO products (
  seller_id, type_key, name, label, brand, description, category, subcategory,
  status, price, price_max, rating, review_count, guarantee, is_active,
  shipping_type, weight_oz, length_in, width_in, height_in,
  primary_material, processing_days
) VALUES (
  'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9', 'recliner', 'Recliner', 'Recliner', 'Comfort King',
  'Sink in and stay a while. This zero-gravity recliner takes the pressure off your spine with an infinite-position mechanism.', 'Seating', 'Recliners',
  'active', 599, 999, 4.4, 156,
  'Lifetime mechanism · 5-year leather', true,
  'calculated', 76, 12, 24, 22,
  'Genuine top-grain leather', 3
);
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, 'Manual', 599, 0
  FROM products WHERE type_key = 'recliner' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, 'Power', 999, 1
  FROM products WHERE type_key = 'recliner' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Cognac', '#a06840', 0
  FROM products WHERE type_key = 'recliner' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Espresso', '#3a2018', 1
  FROM products WHERE type_key = 'recliner' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Stone', '#9a9080', 2
  FROM products WHERE type_key = 'recliner' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';


-- 6. Dining Chair (diningChair)
INSERT INTO products (
  seller_id, type_key, name, label, brand, description, category, subcategory,
  status, price, price_max, rating, review_count, guarantee, is_active,
  shipping_type, weight_oz, length_in, width_in, height_in,
  primary_material, processing_days
) VALUES (
  'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9', 'diningChair', 'Dining Chair', 'Dining Chair', 'TableSide',
  'Sold individually. Stack up to 4 high for easy storage. The tapered legs and contoured back make hours at the table comfortable.', 'Seating', 'Dining Chairs',
  'active', 149, 249, 4.3, 319,
  '3-year warranty', true,
  'calculated', 31, 12, 12, 18,
  'Solid rubber wood legs', 3
);
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, 'Side Chair', 149, 0
  FROM products WHERE type_key = 'diningChair' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, 'Arm Chair', 249, 1
  FROM products WHERE type_key = 'diningChair' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Natural', '#d4b880', 0
  FROM products WHERE type_key = 'diningChair' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Black', '#2a2a2a', 1
  FROM products WHERE type_key = 'diningChair' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Blush', '#e0a8a0', 2
  FROM products WHERE type_key = 'diningChair' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';


-- 7. Bench (bench)
INSERT INTO products (
  seller_id, type_key, name, label, brand, description, category, subcategory,
  status, price, price_max, rating, review_count, guarantee, is_active,
  shipping_type, weight_oz, length_in, width_in, height_in,
  primary_material, processing_days
) VALUES (
  'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9', 'bench', 'Bench', 'Bench', 'WoodCraft Co',
  'A multi-purpose bench for the foot of the bed, entryway, or dining table. Solid hardwood with optional upholstered seat.', 'Seating', 'Benches',
  'active', 199, 349, 4.4, 73,
  '5-year warranty', true,
  'calculated', 36, 24, 12, 10,
  'Solid white oak', 3
);
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, '3 ft', 199, 0
  FROM products WHERE type_key = 'bench' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, '4.5 ft', 349, 1
  FROM products WHERE type_key = 'bench' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Oak', '#c4a060', 0
  FROM products WHERE type_key = 'bench' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Walnut', '#6a4020', 1
  FROM products WHERE type_key = 'bench' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Velvet', '#6a5a9a', 2
  FROM products WHERE type_key = 'bench' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';


-- 8. Ottoman (ottoman)
INSERT INTO products (
  seller_id, type_key, name, label, brand, description, category, subcategory,
  status, price, price_max, rating, review_count, guarantee, is_active,
  shipping_type, weight_oz, length_in, width_in, height_in,
  primary_material, processing_days
) VALUES (
  'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9', 'ottoman', 'Ottoman', 'Ottoman', 'The Cozy Co',
  'Footrest, extra seat, or tray table. The storage version opens to hold blankets and remotes.', 'Seating', 'Ottomans',
  'active', 129, 299, 4.7, 245,
  '2-year warranty', true,
  'calculated', 29, 12, 12, 6,
  'Solid wood base', 3
);
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, 'Round S', 129, 0
  FROM products WHERE type_key = 'ottoman' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, 'Square M', 199, 1
  FROM products WHERE type_key = 'ottoman' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, 'Storage L', 299, 2
  FROM products WHERE type_key = 'ottoman' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Linen', '#e0d0b0', 0
  FROM products WHERE type_key = 'ottoman' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Chocolate', '#5a3820', 1
  FROM products WHERE type_key = 'ottoman' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Dusty Rose', '#d09090', 2
  FROM products WHERE type_key = 'ottoman' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';


-- 9. Floor Cushion (floorCushion)
INSERT INTO products (
  seller_id, type_key, name, label, brand, description, category, subcategory,
  status, price, price_max, rating, review_count, guarantee, is_active,
  shipping_type, weight_oz, length_in, width_in, height_in,
  primary_material, processing_days
) VALUES (
  'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9', 'floorCushion', 'Floor Cushion', 'Floor Cushion', 'The Cozy Co',
  'Plush meditation and reading cushion. Removable cover is machine washable. Works great stacked or spread around a low table.', 'Seating', 'Floor Cushions',
  'active', 45, 95, 4.7, 312,
  '1-year warranty', true,
  'calculated', 21, 12, 12, 3,
  'Cotton linen cover', 3
);
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, '24 in', 45, 0
  FROM products WHERE type_key = 'floorCushion' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, '30 in', 65, 1
  FROM products WHERE type_key = 'floorCushion' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, 'Jumbo', 95, 2
  FROM products WHERE type_key = 'floorCushion' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Oatmeal', '#e8dcc8', 0
  FROM products WHERE type_key = 'floorCushion' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Terracotta', '#c87858', 1
  FROM products WHERE type_key = 'floorCushion' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Sage', '#8a9878', 2
  FROM products WHERE type_key = 'floorCushion' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';

