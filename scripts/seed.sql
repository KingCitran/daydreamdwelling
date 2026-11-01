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

-- 10. Bean Bag (beanBag)
INSERT INTO products (
  seller_id, type_key, name, label, brand, description, category, subcategory,
  status, price, price_max, rating, review_count, guarantee, is_active,
  shipping_type, weight_oz, length_in, width_in, height_in,
  primary_material, processing_days
) VALUES (
  'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9', 'beanBag', 'Bean Bag', 'Bean Bag', 'CloudSit',
  'EPS bead filling with a double-zippered inner liner. Cover is removable and machine washable. Sinks perfectly to your shape.', 'Seating', 'Bean Bags',
  'active', 129, 299, 4.6, 491,
  '2-year warranty', true,
  'calculated', 29, 24, 24, 10,
  'EPS bead fill', 3
);
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, 'Standard', 129, 0
  FROM products WHERE type_key = 'beanBag' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, 'XL', 199, 1
  FROM products WHERE type_key = 'beanBag' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, 'Giant', 299, 2
  FROM products WHERE type_key = 'beanBag' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Violet', '#8a68a8', 0
  FROM products WHERE type_key = 'beanBag' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Charcoal', '#3a3a3a', 1
  FROM products WHERE type_key = 'beanBag' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Cream', '#e8e0d0', 2
  FROM products WHERE type_key = 'beanBag' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';

-- 11. Barstool (barstool)
INSERT INTO products (
  seller_id, type_key, name, label, brand, description, category, subcategory,
  status, price, price_max, rating, review_count, guarantee, is_active,
  shipping_type, weight_oz, length_in, width_in, height_in,
  primary_material, processing_days
) VALUES (
  'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9', 'barstool', 'Barstool', 'Barstool', 'TableSide',
  'A slim-profile stool with a footrest ring and non-scratch rubber tips. Swivel option spins 360°.', 'Seating', 'Barstools',
  'active', 119, 299, 4.4, 238,
  '3-year warranty', true,
  'calculated', 28, 12, 12, 22,
  'Solid beech legs', 3
);
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, 'Counter 24"', 119, 0
  FROM products WHERE type_key = 'barstool' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, 'Bar 30"', 149, 1
  FROM products WHERE type_key = 'barstool' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, 'Swivel', 299, 2
  FROM products WHERE type_key = 'barstool' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Natural Oak', '#c4a070', 0
  FROM products WHERE type_key = 'barstool' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Matte Black', '#2a2a2a', 1
  FROM products WHERE type_key = 'barstool' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Brass', '#c8a840', 2
  FROM products WHERE type_key = 'barstool' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';

-- 12. Chaise Lounge (chaiseLounge)
INSERT INTO products (
  seller_id, type_key, name, label, brand, description, category, subcategory,
  status, price, price_max, rating, review_count, guarantee, is_active,
  shipping_type, weight_oz, length_in, width_in, height_in,
  primary_material, processing_days
) VALUES (
  'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9', 'chaiseLounge', 'Chaise Lounge', 'Chaise Lounge', 'Forma Studio',
  'An iconic elongated lounge chair for reading and afternoon naps. Channeled back cushions and tapered gold legs.', 'Seating', 'Chaise Lounges',
  'active', 549, 899, 4.5, 134,
  '5-year frame · 2-year upholstery', true,
  'calculated', 71, 36, 24, 14,
  'Solid hardwood frame', 3
);
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, 'Left-Facing', 549, 0
  FROM products WHERE type_key = 'chaiseLounge' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, 'Right-Facing', 549, 1
  FROM products WHERE type_key = 'chaiseLounge' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, 'Armless', 899, 2
  FROM products WHERE type_key = 'chaiseLounge' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Warm Sand', '#d4b888', 0
  FROM products WHERE type_key = 'chaiseLounge' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Deep Slate', '#4a5870', 1
  FROM products WHERE type_key = 'chaiseLounge' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Blush Velvet', '#c8909a', 2
  FROM products WHERE type_key = 'chaiseLounge' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';

-- 13. Hanging Chair (swingChair)
INSERT INTO products (
  seller_id, type_key, name, label, brand, description, category, subcategory,
  status, price, price_max, rating, review_count, guarantee, is_active,
  shipping_type, weight_oz, length_in, width_in, height_in,
  primary_material, processing_days
) VALUES (
  'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9', 'swingChair', 'Hanging Chair', 'Hanging Chair', 'Boho Nest',
  'Suspend from a ceiling hook or a freestanding stand (sold separately). Max load 250 lb. Includes a cushion.', 'Seating', 'Hanging Chairs',
  'active', 249, 449, 4.8, 567,
  '1-year warranty', true,
  'calculated', 41, 24, 24, 18,
  'Rattan or rope weave', 3
);
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, 'Basket', 249, 0
  FROM products WHERE type_key = 'swingChair' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, 'Hammock', 449, 1
  FROM products WHERE type_key = 'swingChair' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Natural', '#d4b870', 0
  FROM products WHERE type_key = 'swingChair' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Black', '#2a2a2a', 1
  FROM products WHERE type_key = 'swingChair' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Macramé', '#e8d8b0', 2
  FROM products WHERE type_key = 'swingChair' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';

-- 14. Dining Table (diningTable)
INSERT INTO products (
  seller_id, type_key, name, label, brand, description, category, subcategory,
  status, price, price_max, rating, review_count, guarantee, is_active,
  shipping_type, weight_oz, length_in, width_in, height_in,
  primary_material, processing_days
) VALUES (
  'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9', 'diningTable', 'Dining Table', 'Dining Table', 'WoodCraft Co',
  'A solid hardwood dining table built to last generations. Mortise-and-tenon joinery means no wobble, ever.', 'Tables', 'Dining Tables',
  'active', 449, 1199, 4.5, 213,
  '10-year structural warranty', true,
  'calculated', 61, 36, 24, 12,
  'Solid white oak top', 3
);
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, '2-Person', 449, 0
  FROM products WHERE type_key = 'diningTable' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, '4-Person', 699, 1
  FROM products WHERE type_key = 'diningTable' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, '6-Person', 899, 2
  FROM products WHERE type_key = 'diningTable' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, '8-Person', 1199, 3
  FROM products WHERE type_key = 'diningTable' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Oak', '#c4915a', 0
  FROM products WHERE type_key = 'diningTable' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Walnut', '#5a3a1a', 1
  FROM products WHERE type_key = 'diningTable' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'White', '#f0ece8', 2
  FROM products WHERE type_key = 'diningTable' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';

-- 15. Coffee Table (coffeeTable)
INSERT INTO products (
  seller_id, type_key, name, label, brand, description, category, subcategory,
  status, price, price_max, rating, review_count, guarantee, is_active,
  shipping_type, weight_oz, length_in, width_in, height_in,
  primary_material, processing_days
) VALUES (
  'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9', 'coffeeTable', 'Coffee Table', 'Coffee Table', 'WoodCraft Co',
  'A sleek coffee table with a hand-finished top and solid tapered legs. Ships fully assembled.', 'Tables', 'Coffee Tables',
  'active', 299, 499, 4.4, 167,
  '3-year warranty', true,
  'calculated', 46, 24, 12, 6,
  'Marble veneer or solid walnut top', 3
);
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, 'Small', 299, 0
  FROM products WHERE type_key = 'coffeeTable' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, 'Large', 499, 1
  FROM products WHERE type_key = 'coffeeTable' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Marble', '#e8e4df', 0
  FROM products WHERE type_key = 'coffeeTable' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Walnut', '#8b6343', 1
  FROM products WHERE type_key = 'coffeeTable' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Smoked', '#3a3530', 2
  FROM products WHERE type_key = 'coffeeTable' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';

-- 16. Side Table (sideTable)
INSERT INTO products (
  seller_id, type_key, name, label, brand, description, category, subcategory,
  status, price, price_max, rating, review_count, guarantee, is_active,
  shipping_type, weight_oz, length_in, width_in, height_in,
  primary_material, processing_days
) VALUES (
  'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9', 'sideTable', 'Side Table', 'Side Table', 'WoodCraft Co',
  'The perfect companion to your sofa or armchair. Wide enough for a lamp, book, and your drink.', 'Tables', 'Side Tables',
  'active', 129, 229, 4.5, 189,
  '3-year warranty', true,
  'calculated', 29, 12, 12, 8,
  'Solid ash top', 3
);
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, 'Round', 129, 0
  FROM products WHERE type_key = 'sideTable' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, 'Square', 179, 1
  FROM products WHERE type_key = 'sideTable' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, 'Tiered', 229, 2
  FROM products WHERE type_key = 'sideTable' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Ash', '#d8c8a8', 0
  FROM products WHERE type_key = 'sideTable' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Black', '#2a2a2a', 1
  FROM products WHERE type_key = 'sideTable' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Brass', '#c8a840', 2
  FROM products WHERE type_key = 'sideTable' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';

-- 17. Console Table (consoleTable)
INSERT INTO products (
  seller_id, type_key, name, label, brand, description, category, subcategory,
  status, price, price_max, rating, review_count, guarantee, is_active,
  shipping_type, weight_oz, length_in, width_in, height_in,
  primary_material, processing_days
) VALUES (
  'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9', 'consoleTable', 'Console Table', 'Console Table', 'Forma Studio',
  'A narrow console for entryways and living room walls. Comes with an optional lower shelf for extra storage.', 'Tables', 'Console Tables',
  'active', 259, 499, 4.3, 98,
  '3-year warranty', true,
  'calculated', 42, 36, 12, 12,
  'Solid rubber wood', 3
);
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, '36 in', 259, 0
  FROM products WHERE type_key = 'consoleTable' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, '48 in', 349, 1
  FROM products WHERE type_key = 'consoleTable' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, '60 in', 499, 2
  FROM products WHERE type_key = 'consoleTable' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Natural', '#d8b880', 0
  FROM products WHERE type_key = 'consoleTable' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'White', '#f4f0ea', 1
  FROM products WHERE type_key = 'consoleTable' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Matte Black', '#2a2a2a', 2
  FROM products WHERE type_key = 'consoleTable' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';

-- 18. Desk (desk)
INSERT INTO products (
  seller_id, type_key, name, label, brand, description, category, subcategory,
  status, price, price_max, rating, review_count, guarantee, is_active,
  shipping_type, weight_oz, length_in, width_in, height_in,
  primary_material, processing_days
) VALUES (
  'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9', 'desk', 'Desk', 'Desk', 'WorkSpace Pro',
  'An ergonomic desk with integrated cable management and a scratch-resistant top. Built for long sessions.', 'Tables', 'Desks',
  'active', 349, 699, 4.7, 301,
  '5-year warranty', true,
  'calculated', 51, 24, 12, 12,
  'Steel powder-coated frame', 3
);
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, 'Compact', 349, 0
  FROM products WHERE type_key = 'desk' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, 'Standard', 499, 1
  FROM products WHERE type_key = 'desk' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, 'L-Shape', 699, 2
  FROM products WHERE type_key = 'desk' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Ocean', '#7b9eb5', 0
  FROM products WHERE type_key = 'desk' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'White', '#f0f0f0', 1
  FROM products WHERE type_key = 'desk' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Black', '#2a2a2a', 2
  FROM products WHERE type_key = 'desk' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';

-- 19. Bar Table (barTable)
INSERT INTO products (
  seller_id, type_key, name, label, brand, description, category, subcategory,
  status, price, price_max, rating, review_count, guarantee, is_active,
  shipping_type, weight_oz, length_in, width_in, height_in,
  primary_material, processing_days
) VALUES (
  'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9', 'barTable', 'Bar Table', 'Bar Table', 'TableSide',
  'Counter-height bistro table for casual dining and bar seating. Pairs with our 30" barstools.', 'Tables', 'Bar & Counter Tables',
  'active', 179, 329, 4.3, 89,
  '3-year warranty', true,
  'calculated', 34, 12, 12, 13,
  'Steel base', 3
);
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, 'Round 24"', 179, 0
  FROM products WHERE type_key = 'barTable' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, 'Square 28"', 329, 1
  FROM products WHERE type_key = 'barTable' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Walnut', '#7a5030', 0
  FROM products WHERE type_key = 'barTable' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Matte Black', '#2a2a2a', 1
  FROM products WHERE type_key = 'barTable' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'White Marble', '#f0ece8', 2
  FROM products WHERE type_key = 'barTable' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';

-- 20. Nesting Tables (nestingTables)
INSERT INTO products (
  seller_id, type_key, name, label, brand, description, category, subcategory,
  status, price, price_max, rating, review_count, guarantee, is_active,
  shipping_type, weight_oz, length_in, width_in, height_in,
  primary_material, processing_days
) VALUES (
  'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9', 'nestingTables', 'Nesting Tables', 'Nesting Tables', 'WoodCraft Co',
  'Stack when not in use, spread out for extra surface space. Each table has solid wood legs and a smooth top.', 'Tables', 'Nesting Tables',
  'active', 189, 349, 4.5, 143,
  '5-year warranty', true,
  'calculated', 35, 24, 12, 7,
  'Solid rubberwood', 3
);
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, 'Set of 2', 189, 0
  FROM products WHERE type_key = 'nestingTables' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, 'Set of 3', 349, 1
  FROM products WHERE type_key = 'nestingTables' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Oak', '#c4a070', 0
  FROM products WHERE type_key = 'nestingTables' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Walnut', '#6a4020', 1
  FROM products WHERE type_key = 'nestingTables' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'White', '#f4f0ea', 2
  FROM products WHERE type_key = 'nestingTables' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';

-- 21. Kitchen Island (kitchenIsland)
INSERT INTO products (
  seller_id, type_key, name, label, brand, description, category, subcategory,
  status, price, price_max, rating, review_count, guarantee, is_active,
  shipping_type, weight_oz, length_in, width_in, height_in,
  primary_material, processing_days
) VALUES (
  'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9', 'kitchenIsland', 'Kitchen Island', 'Kitchen Island', 'HomeBase',
  'A freestanding kitchen island with two deep drawers, a cabinet, and a hanging pot rack option. Ships flat-pack.', 'Tables', 'Kitchen Islands',
  'active', 499, 999, 4.6, 201,
  '5-year warranty', true,
  'calculated', 66, 36, 24, 12,
  'Solid wood top', 3
);
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, '48 in', 499, 0
  FROM products WHERE type_key = 'kitchenIsland' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, '60 in', 699, 1
  FROM products WHERE type_key = 'kitchenIsland' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, '72 in', 999, 2
  FROM products WHERE type_key = 'kitchenIsland' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'White', '#f4f0ea', 0
  FROM products WHERE type_key = 'kitchenIsland' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Shaker Blue', '#4a6a8a', 1
  FROM products WHERE type_key = 'kitchenIsland' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Natural Oak', '#c4a070', 2
  FROM products WHERE type_key = 'kitchenIsland' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';

-- 22. Bookshelf (bookshelf)
INSERT INTO products (
  seller_id, type_key, name, label, brand, description, category, subcategory,
  status, price, price_max, rating, review_count, guarantee, is_active,
  shipping_type, weight_oz, length_in, width_in, height_in,
  primary_material, processing_days
) VALUES (
  'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9', 'bookshelf', 'Bookshelf', 'Bookshelf', 'ShelfMaster',
  'Adjustable shelving that adapts as your collection grows. Sturdy back panel prevents racking.', 'Storage', 'Bookshelves',
  'active', 199, 399, 4.2, 95,
  '5-year warranty', true,
  'calculated', 36, 24, 12, 30,
  'Engineered hardwood', 3
);
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, '2-Shelf', 199, 0
  FROM products WHERE type_key = 'bookshelf' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, '4-Shelf', 279, 1
  FROM products WHERE type_key = 'bookshelf' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, 'Wide', 399, 2
  FROM products WHERE type_key = 'bookshelf' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Oak', '#c4a882', 0
  FROM products WHERE type_key = 'bookshelf' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'White', '#f0f0ee', 1
  FROM products WHERE type_key = 'bookshelf' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Black', '#2a2a2a', 2
  FROM products WHERE type_key = 'bookshelf' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';

-- 23. Cabinet (cabinet)
INSERT INTO products (
  seller_id, type_key, name, label, brand, description, category, subcategory,
  status, price, price_max, rating, review_count, guarantee, is_active,
  shipping_type, weight_oz, length_in, width_in, height_in,
  primary_material, processing_days
) VALUES (
  'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9', 'cabinet', 'Cabinet', 'Cabinet', 'ShelfMaster',
  'Concealed storage with solid wood doors and a soft-close hinge system. Inside has one adjustable shelf.', 'Storage', 'Cabinets',
  'active', 349, 699, 4.3, 112,
  '5-year warranty', true,
  'calculated', 51, 24, 12, 24,
  'Solid pine frame', 3
);
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, 'Single Door', 349, 0
  FROM products WHERE type_key = 'cabinet' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, 'Double Door', 499, 1
  FROM products WHERE type_key = 'cabinet' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, 'Tall', 699, 2
  FROM products WHERE type_key = 'cabinet' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Sage', '#8a9880', 0
  FROM products WHERE type_key = 'cabinet' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'White', '#f4f0ec', 1
  FROM products WHERE type_key = 'cabinet' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Navy', '#2a3a5a', 2
  FROM products WHERE type_key = 'cabinet' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';

-- 24. Dresser (dresser)
INSERT INTO products (
  seller_id, type_key, name, label, brand, description, category, subcategory,
  status, price, price_max, rating, review_count, guarantee, is_active,
  shipping_type, weight_oz, length_in, width_in, height_in,
  primary_material, processing_days
) VALUES (
  'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9', 'dresser', 'Dresser', 'Dresser', 'DreamRest',
  'Smooth-glide drawers with dovetail joints — built to be opened a thousand times without loosening.', 'Storage', 'Dressers',
  'active', 449, 799, 4.6, 178,
  '10-year warranty', true,
  'calculated', 61, 24, 12, 18,
  'Solid oak drawer faces', 3
);
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, '4 Drawer', 449, 0
  FROM products WHERE type_key = 'dresser' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, '6 Drawer', 649, 1
  FROM products WHERE type_key = 'dresser' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, 'Tall 8', 799, 2
  FROM products WHERE type_key = 'dresser' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'White Oak', '#d8c8a0', 0
  FROM products WHERE type_key = 'dresser' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Ebony', '#2a2018', 1
  FROM products WHERE type_key = 'dresser' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Dusty Mint', '#9abaa8', 2
  FROM products WHERE type_key = 'dresser' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';

-- 25. TV Stand (tvStand)
INSERT INTO products (
  seller_id, type_key, name, label, brand, description, category, subcategory,
  status, price, price_max, rating, review_count, guarantee, is_active,
  shipping_type, weight_oz, length_in, width_in, height_in,
  primary_material, processing_days
) VALUES (
  'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9', 'tvStand', 'TV Stand', 'TV Stand', 'MediaLine',
  'A media console with open shelving for consoles and a cable management channel along the back.', 'Storage', 'TV Stands',
  'active', 299, 549, 4.4, 234,
  '3-year warranty', true,
  'calculated', 46, 36, 12, 10,
  'Particleboard with real-wood veneer', 3
);
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, '48 in', 299, 0
  FROM products WHERE type_key = 'tvStand' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, '60 in', 399, 1
  FROM products WHERE type_key = 'tvStand' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, '72 in', 549, 2
  FROM products WHERE type_key = 'tvStand' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Charcoal Oak', '#5a5045', 0
  FROM products WHERE type_key = 'tvStand' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'White', '#f4f0ec', 1
  FROM products WHERE type_key = 'tvStand' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Walnut', '#7a5030', 2
  FROM products WHERE type_key = 'tvStand' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';

-- 26. Wardrobe (wardrobe)
INSERT INTO products (
  seller_id, type_key, name, label, brand, description, category, subcategory,
  status, price, price_max, rating, review_count, guarantee, is_active,
  shipping_type, weight_oz, length_in, width_in, height_in,
  primary_material, processing_days
) VALUES (
  'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9', 'wardrobe', 'Wardrobe', 'Wardrobe', 'ShelfMaster',
  'Full-height wardrobe with a hanging rail, adjustable shelves, and a full-width mirror door option. Anti-tip hardware included.', 'Storage', 'Wardrobes',
  'active', 599, 1199, 4.4, 187,
  '5-year warranty', true,
  'calculated', 76, 36, 12, 30,
  'Particleboard body', 3
);
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, '2-Door', 599, 0
  FROM products WHERE type_key = 'wardrobe' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, '3-Door', 799, 1
  FROM products WHERE type_key = 'wardrobe' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, 'Walk-In', 1199, 2
  FROM products WHERE type_key = 'wardrobe' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'White', '#f4f0ea', 0
  FROM products WHERE type_key = 'wardrobe' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Oak', '#c4a070', 1
  FROM products WHERE type_key = 'wardrobe' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Midnight', '#2a2a3a', 2
  FROM products WHERE type_key = 'wardrobe' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';

-- 27. Sideboard (sideboard)
INSERT INTO products (
  seller_id, type_key, name, label, brand, description, category, subcategory,
  status, price, price_max, rating, review_count, guarantee, is_active,
  shipping_type, weight_oz, length_in, width_in, height_in,
  primary_material, processing_days
) VALUES (
  'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9', 'sideboard', 'Sideboard', 'Sideboard', 'WoodCraft Co',
  'Low-profile buffet with sliding doors and adjustable interior shelving. Perfect behind a sofa or against a dining room wall.', 'Storage', 'Sideboards',
  'active', 449, 799, 4.5, 162,
  '10-year structural warranty', true,
  'calculated', 61, 48, 12, 12,
  'Solid teak or oak', 3
);
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, '48 in', 449, 0
  FROM products WHERE type_key = 'sideboard' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, '60 in', 599, 1
  FROM products WHERE type_key = 'sideboard' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, '72 in', 799, 2
  FROM products WHERE type_key = 'sideboard' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Walnut', '#7a5030', 0
  FROM products WHERE type_key = 'sideboard' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'White Oak', '#d4b880', 1
  FROM products WHERE type_key = 'sideboard' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Matte Black', '#2a2a2a', 2
  FROM products WHERE type_key = 'sideboard' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';

-- 28. Shoe Rack (shoeRack)
INSERT INTO products (
  seller_id, type_key, name, label, brand, description, category, subcategory,
  status, price, price_max, rating, review_count, guarantee, is_active,
  shipping_type, weight_oz, length_in, width_in, height_in,
  primary_material, processing_days
) VALUES (
  'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9', 'shoeRack', 'Shoe Rack', 'Shoe Rack', 'HomeBase',
  'Open-frame shoe storage for entryways. The bench version adds a padded seat for putting on shoes.', 'Storage', 'Shoe Racks',
  'active', 69, 169, 4.3, 428,
  '1-year warranty', true,
  'calculated', 23, 24, 12, 12,
  'Solid bamboo or pine', 3
);
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, '3-Tier', 69, 0
  FROM products WHERE type_key = 'shoeRack' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, '5-Tier', 109, 1
  FROM products WHERE type_key = 'shoeRack' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, 'Bench', 169, 2
  FROM products WHERE type_key = 'shoeRack' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Bamboo', '#d4b870', 0
  FROM products WHERE type_key = 'shoeRack' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'White', '#f4f0ea', 1
  FROM products WHERE type_key = 'shoeRack' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Black', '#2a2a2a', 2
  FROM products WHERE type_key = 'shoeRack' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';

-- 29. Entryway Storage (entryBench)
INSERT INTO products (
  seller_id, type_key, name, label, brand, description, category, subcategory,
  status, price, price_max, rating, review_count, guarantee, is_active,
  shipping_type, weight_oz, length_in, width_in, height_in,
  primary_material, processing_days
) VALUES (
  'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9', 'entryBench', 'Entryway Storage', 'Entryway Storage', 'HomeBase',
  'Coat hooks up top, cubby storage below, and a padded bench seat in the middle. The all-in-one entryway solution.', 'Storage', 'Entryway Units',
  'active', 299, 549, 4.5, 214,
  '3-year warranty', true,
  'calculated', 46, 36, 12, 22,
  'Engineered wood body', 3
);
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, 'Compact', 299, 0
  FROM products WHERE type_key = 'entryBench' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, 'Standard', 399, 1
  FROM products WHERE type_key = 'entryBench' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, 'Wide', 549, 2
  FROM products WHERE type_key = 'entryBench' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'White', '#f4f0ea', 0
  FROM products WHERE type_key = 'entryBench' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Black', '#2a2a2a', 1
  FROM products WHERE type_key = 'entryBench' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Walnut', '#7a5030', 2
  FROM products WHERE type_key = 'entryBench' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';

-- 30. Bed Frame (bed)
INSERT INTO products (
  seller_id, type_key, name, label, brand, description, category, subcategory,
  status, price, price_max, rating, review_count, guarantee, is_active,
  shipping_type, weight_oz, length_in, width_in, height_in,
  primary_material, processing_days
) VALUES (
  'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9', 'bed', 'Bed Frame', 'Bed Frame', 'DreamRest',
  'A platform bed with an upholstered headboard and solid wood slat system. No box spring needed.', 'Bedroom', 'Bed Frames',
  'active', 599, 1199, 4.8, 412,
  '10-year frame · 2-year upholstery', true,
  'calculated', 76, 36, 48, 18,
  'Solid pine slats', 3
);
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, 'Twin', 599, 0
  FROM products WHERE type_key = 'bed' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, 'Full', 749, 1
  FROM products WHERE type_key = 'bed' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, 'Queen', 899, 2
  FROM products WHERE type_key = 'bed' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, 'King', 1199, 3
  FROM products WHERE type_key = 'bed' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Lilac', '#9b8ea8', 0
  FROM products WHERE type_key = 'bed' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Cream', '#c8b89a', 1
  FROM products WHERE type_key = 'bed' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Ink', '#2a3a5a', 2
  FROM products WHERE type_key = 'bed' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';

-- 31. Nightstand (nightstand)
INSERT INTO products (
  seller_id, type_key, name, label, brand, description, category, subcategory,
  status, price, price_max, rating, review_count, guarantee, is_active,
  shipping_type, weight_oz, length_in, width_in, height_in,
  primary_material, processing_days
) VALUES (
  'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9', 'nightstand', 'Nightstand', 'Nightstand', 'DreamRest',
  'Everything you need within arm''s reach. A charging shelf, drawer for the book, and cable pass-through.', 'Bedroom', 'Nightstands',
  'active', 179, 299, 4.5, 287,
  '5-year warranty', true,
  'calculated', 34, 12, 12, 10,
  'Solid oak top', 3
);
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, 'Open Shelf', 179, 0
  FROM products WHERE type_key = 'nightstand' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, '1 Drawer', 229, 1
  FROM products WHERE type_key = 'nightstand' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, '2 Drawer', 299, 2
  FROM products WHERE type_key = 'nightstand' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Light Oak', '#d8c8a0', 0
  FROM products WHERE type_key = 'nightstand' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Walnut', '#6a4820', 1
  FROM products WHERE type_key = 'nightstand' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Matte White', '#f0ece8', 2
  FROM products WHERE type_key = 'nightstand' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';

-- 32. Bunk Bed (bunkBed)
INSERT INTO products (
  seller_id, type_key, name, label, brand, description, category, subcategory,
  status, price, price_max, rating, review_count, guarantee, is_active,
  shipping_type, weight_oz, length_in, width_in, height_in,
  primary_material, processing_days
) VALUES (
  'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9', 'bunkBed', 'Bunk Bed', 'Bunk Bed', 'Playroom Co',
  'Solid wood bunk bed with a full-length safety rail on the top bunk and built-in ladder. Guardrail meets ASTM standards.', 'Bedroom', 'Bunk Beds',
  'active', 599, 999, 4.5, 341,
  '10-year warranty', true,
  'calculated', 76, 24, 48, 26,
  'Solid pine frame', 3
);
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, 'Twin/Twin', 599, 0
  FROM products WHERE type_key = 'bunkBed' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, 'Full/Full', 799, 1
  FROM products WHERE type_key = 'bunkBed' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, 'Twin/Full', 999, 2
  FROM products WHERE type_key = 'bunkBed' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'White', '#f4f0ea', 0
  FROM products WHERE type_key = 'bunkBed' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Grey', '#8a8a8a', 1
  FROM products WHERE type_key = 'bunkBed' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Natural Pine', '#d4b068', 2
  FROM products WHERE type_key = 'bunkBed' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';

-- 33. Daybed (daybed)
INSERT INTO products (
  seller_id, type_key, name, label, brand, description, category, subcategory,
  status, price, price_max, rating, review_count, guarantee, is_active,
  shipping_type, weight_oz, length_in, width_in, height_in,
  primary_material, processing_days
) VALUES (
  'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9', 'daybed', 'Daybed', 'Daybed', 'DreamRest',
  'A sofa by day, a bed by night. Channel-tufted back cushions stay in place without pins. Ships with a standard size mattress.', 'Bedroom', 'Daybeds',
  'active', 449, 799, 4.6, 178,
  '5-year frame · 2-year upholstery', true,
  'calculated', 61, 24, 48, 12,
  'Kiln-dried hardwood frame', 3
);
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, 'Twin', 449, 0
  FROM products WHERE type_key = 'daybed' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, 'Full', 799, 1
  FROM products WHERE type_key = 'daybed' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Blush', '#d4a8a8', 0
  FROM products WHERE type_key = 'daybed' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Charcoal', '#4a4a5a', 1
  FROM products WHERE type_key = 'daybed' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Ivory', '#e8e0d0', 2
  FROM products WHERE type_key = 'daybed' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';

-- 34. Crib (crib)
INSERT INTO products (
  seller_id, type_key, name, label, brand, description, category, subcategory,
  status, price, price_max, rating, review_count, guarantee, is_active,
  shipping_type, weight_oz, length_in, width_in, height_in,
  primary_material, processing_days
) VALUES (
  'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9', 'crib', 'Crib', 'Crib', 'Playroom Co',
  'JPMA certified crib with adjustable mattress height. The convertible model transitions to a toddler bed and full-size bed.', 'Bedroom', 'Cribs & Baby',
  'active', 299, 599, 4.8, 523,
  'Lifetime warranty', true,
  'calculated', 46, 24, 36, 14,
  'TSCA-certified solid pine', 3
);
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, 'Standard', 299, 0
  FROM products WHERE type_key = 'crib' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, 'Convertible', 599, 1
  FROM products WHERE type_key = 'crib' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'White', '#f4f0ea', 0
  FROM products WHERE type_key = 'crib' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Natural', '#d4b880', 1
  FROM products WHERE type_key = 'crib' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Grey', '#9a9898', 2
  FROM products WHERE type_key = 'crib' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';

-- 35. Vanity Table (vanityTable)
INSERT INTO products (
  seller_id, type_key, name, label, brand, description, category, subcategory,
  status, price, price_max, rating, review_count, guarantee, is_active,
  shipping_type, weight_oz, length_in, width_in, height_in,
  primary_material, processing_days
) VALUES (
  'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9', 'vanityTable', 'Vanity Table', 'Vanity Table', 'Reflect Co',
  'A dedicated makeup station with a lighted Hollywood mirror. Tabletop drawer organizer included. USB charging strip built in.', 'Bedroom', 'Vanity Tables',
  'active', 299, 599, 4.6, 387,
  '2-year warranty', true,
  'calculated', 46, 24, 12, 22,
  'MDF with lacquer finish', 3
);
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, 'Compact', 299, 0
  FROM products WHERE type_key = 'vanityTable' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, 'Hollywood', 599, 1
  FROM products WHERE type_key = 'vanityTable' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'White', '#f4f0ea', 0
  FROM products WHERE type_key = 'vanityTable' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Rose Gold', '#e0a898', 1
  FROM products WHERE type_key = 'vanityTable' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Matte Black', '#2a2a2a', 2
  FROM products WHERE type_key = 'vanityTable' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';

-- 36. Mirror (mirror)
INSERT INTO products (
  seller_id, type_key, name, label, brand, description, category, subcategory,
  status, price, price_max, rating, review_count, guarantee, is_active,
  shipping_type, weight_oz, length_in, width_in, height_in,
  primary_material, processing_days
) VALUES (
  'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9', 'mirror', 'Mirror', 'Mirror', 'Reflect Co',
  'Place near a wall for the full effect. The beveled edge catches light and adds depth to any room.', 'Wall Decor', 'Mirrors',
  'active', 199, 499, 4.7, 321,
  '1-year warranty', true,
  'calculated', 36, 12, 2, 24,
  'Beveled mirror glass', 3
);
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, '24 in Round', 199, 0
  FROM products WHERE type_key = 'mirror' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, '36 in Arch', 299, 1
  FROM products WHERE type_key = 'mirror' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, '72 in Full', 499, 2
  FROM products WHERE type_key = 'mirror' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Brass', '#c8a840', 0
  FROM products WHERE type_key = 'mirror' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Matte Black', '#2a2a2a', 1
  FROM products WHERE type_key = 'mirror' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Chrome', '#c0c8d0', 2
  FROM products WHERE type_key = 'mirror' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';

-- 37. Art Print (wallArt)
INSERT INTO products (
  seller_id, type_key, name, label, brand, description, category, subcategory,
  status, price, price_max, rating, review_count, guarantee, is_active,
  shipping_type, weight_oz, length_in, width_in, height_in,
  primary_material, processing_days
) VALUES (
  'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9', 'wallArt', 'Art Print', 'Art Print', 'Studio PAPER',
  'Museum-quality giclée prints on 300 gsm archival paper. Place against the wall for display.', 'Wall Decor', 'Art Prints',
  'active', 49, 199, 4.9, 678,
  'Lifetime print guarantee', true,
  'calculated', 21, 12, 1, 14,
  'Archival 300 gsm paper', 3
);
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, '8×10 in', 49, 0
  FROM products WHERE type_key = 'wallArt' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, '16×20 in', 99, 1
  FROM products WHERE type_key = 'wallArt' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, '24×36 in', 199, 2
  FROM products WHERE type_key = 'wallArt' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Warm Tones', '#d4a870', 0
  FROM products WHERE type_key = 'wallArt' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Cool Blues', '#7090b8', 1
  FROM products WHERE type_key = 'wallArt' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Monochrome', '#808080', 2
  FROM products WHERE type_key = 'wallArt' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';

-- 38. Wall Shelf (wallShelf)
INSERT INTO products (
  seller_id, type_key, name, label, brand, description, category, subcategory,
  status, price, price_max, rating, review_count, guarantee, is_active,
  shipping_type, weight_oz, length_in, width_in, height_in,
  primary_material, processing_days
) VALUES (
  'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9', 'wallShelf', 'Wall Shelf', 'Wall Shelf', 'ShelfMaster',
  'A floating shelf that installs flush against the wall. Hidden bracket system means clean, seamless styling.', 'Wall Decor', 'Wall Shelves',
  'active', 69, 149, 4.4, 192,
  '2-year warranty', true,
  'calculated', 23, 24, 4, 4,
  'Solid pine or MDF', 3
);
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, '24 in', 69, 0
  FROM products WHERE type_key = 'wallShelf' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, '36 in', 99, 1
  FROM products WHERE type_key = 'wallShelf' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, '48 in', 149, 2
  FROM products WHERE type_key = 'wallShelf' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Natural', '#d4b880', 0
  FROM products WHERE type_key = 'wallShelf' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Black', '#2a2a2a', 1
  FROM products WHERE type_key = 'wallShelf' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'White', '#f0ece8', 2
  FROM products WHERE type_key = 'wallShelf' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';

-- 39. Tapestry (tapestry)
INSERT INTO products (
  seller_id, type_key, name, label, brand, description, category, subcategory,
  status, price, price_max, rating, review_count, guarantee, is_active,
  shipping_type, weight_oz, length_in, width_in, height_in,
  primary_material, processing_days
) VALUES (
  'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9', 'tapestry', 'Tapestry', 'Tapestry', 'Threadwork',
  'Handwoven by artisan cooperatives. Each piece has slight natural variations that make it unique.', 'Wall Decor', 'Tapestries',
  'active', 59, 129, 4.6, 445,
  '60-day return policy', true,
  'calculated', 22, 24, 1, 18,
  '100% cotton warp & weft', 3
);
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, '51×60 in', 59, 0
  FROM products WHERE type_key = 'tapestry' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, '60×80 in', 89, 1
  FROM products WHERE type_key = 'tapestry' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, '80×104 in', 129, 2
  FROM products WHERE type_key = 'tapestry' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Boho Earth', '#c8a060', 0
  FROM products WHERE type_key = 'tapestry' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Midnight', '#2a2a4a', 1
  FROM products WHERE type_key = 'tapestry' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Desert Rose', '#c88080', 2
  FROM products WHERE type_key = 'tapestry' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';

-- 40. Wall Clock (wallClock)
INSERT INTO products (
  seller_id, type_key, name, label, brand, description, category, subcategory,
  status, price, price_max, rating, review_count, guarantee, is_active,
  shipping_type, weight_oz, length_in, width_in, height_in,
  primary_material, processing_days
) VALUES (
  'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9', 'wallClock', 'Wall Clock', 'Wall Clock', 'Reflect Co',
  'A silent-sweep quartz movement so you never hear the ticking. Open-frame or solid face options available.', 'Wall Decor', 'Wall Clocks',
  'active', 49, 149, 4.5, 621,
  '2-year warranty', true,
  'calculated', 21, 12, 1, 10,
  'Metal or wood frame', 3
);
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, '12 in', 49, 0
  FROM products WHERE type_key = 'wallClock' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, '18 in', 89, 1
  FROM products WHERE type_key = 'wallClock' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, '24 in', 149, 2
  FROM products WHERE type_key = 'wallClock' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Brass', '#c8a840', 0
  FROM products WHERE type_key = 'wallClock' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Matte Black', '#2a2a2a', 1
  FROM products WHERE type_key = 'wallClock' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'White', '#f0ece8', 2
  FROM products WHERE type_key = 'wallClock' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';

-- 41. Macramé Wall Hanging (macrame)
INSERT INTO products (
  seller_id, type_key, name, label, brand, description, category, subcategory,
  status, price, price_max, rating, review_count, guarantee, is_active,
  shipping_type, weight_oz, length_in, width_in, height_in,
  primary_material, processing_days
) VALUES (
  'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9', 'macrame', 'Macramé Wall Hanging', 'Macramé Wall Hanging', 'Boho Nest',
  'Hand-knotted cotton rope with driftwood dowel. Each piece is slightly different due to the hand-made process.', 'Wall Decor', 'Macramé',
  'active', 55, 139, 4.7, 389,
  '60-day satisfaction guarantee', true,
  'calculated', 22, 24, 1, 14,
  '3mm cotton rope', 3
);
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, 'Small', 55, 0
  FROM products WHERE type_key = 'macrame' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, 'Medium', 89, 1
  FROM products WHERE type_key = 'macrame' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, 'Large', 139, 2
  FROM products WHERE type_key = 'macrame' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Natural', '#e8d8b0', 0
  FROM products WHERE type_key = 'macrame' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Dusty Rose', '#d0a0a0', 1
  FROM products WHERE type_key = 'macrame' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Charcoal', '#4a4040', 2
  FROM products WHERE type_key = 'macrame' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';

-- 42. Floor Lamp (floorLamp)
INSERT INTO products (
  seller_id, type_key, name, label, brand, description, category, subcategory,
  status, price, price_max, rating, review_count, guarantee, is_active,
  shipping_type, weight_oz, length_in, width_in, height_in,
  primary_material, processing_days
) VALUES (
  'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9', 'floorLamp', 'Floor Lamp', 'Floor Lamp', 'LightForm',
  'A statement lamp that doubles as sculpture. Dimmable LED compatible, 360° rotation on the arc models.', 'Lighting', 'Floor Lamps',
  'active', 149, 349, 4.5, 267,
  '3-year electrical warranty', true,
  'calculated', 31, 12, 12, 24,
  'Powder-coated steel or brass', 3
);
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, 'Arc', 249, 0
  FROM products WHERE type_key = 'floorLamp' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, 'Tripod', 149, 1
  FROM products WHERE type_key = 'floorLamp' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, 'Torchiere', 349, 2
  FROM products WHERE type_key = 'floorLamp' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Brass', '#c8a840', 0
  FROM products WHERE type_key = 'floorLamp' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Matte Black', '#2a2a2a', 1
  FROM products WHERE type_key = 'floorLamp' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Nickel', '#9a9898', 2
  FROM products WHERE type_key = 'floorLamp' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';

-- 43. Table Lamp (tableLamp)
INSERT INTO products (
  seller_id, type_key, name, label, brand, description, category, subcategory,
  status, price, price_max, rating, review_count, guarantee, is_active,
  shipping_type, weight_oz, length_in, width_in, height_in,
  primary_material, processing_days
) VALUES (
  'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9', 'tableLamp', 'Table Lamp', 'Table Lamp', 'LightForm',
  'A handmade ceramic base paired with a drum shade. Warm 2700K light for the coziest glow.', 'Lighting', 'Table Lamps',
  'active', 89, 199, 4.6, 344,
  '2-year electrical warranty', true,
  'calculated', 25, 12, 12, 12,
  'Hand-thrown ceramic base', 3
);
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, 'Compact', 89, 0
  FROM products WHERE type_key = 'tableLamp' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, 'Standard', 129, 1
  FROM products WHERE type_key = 'tableLamp' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, 'Tall', 199, 2
  FROM products WHERE type_key = 'tableLamp' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Ceramic White', '#f0ece4', 0
  FROM products WHERE type_key = 'tableLamp' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Terracotta', '#c4785a', 1
  FROM products WHERE type_key = 'tableLamp' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Deep Navy', '#1e3060', 2
  FROM products WHERE type_key = 'tableLamp' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';

-- 44. String Lights (stringLights)
INSERT INTO products (
  seller_id, type_key, name, label, brand, description, category, subcategory,
  status, price, price_max, rating, review_count, guarantee, is_active,
  shipping_type, weight_oz, length_in, width_in, height_in,
  primary_material, processing_days
) VALUES (
  'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9', 'stringLights', 'String Lights', 'String Lights', 'LightForm',
  'Place along walls or drape across headboards. Shown as a coiled bundle — drape over walls and furniture for effect.', 'Lighting', 'String Lights',
  'active', 29, 59, 4.8, 892,
  '1-year warranty', true,
  'calculated', 19, 24, 12, 1,
  'Copper wire', 3
);
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, '10 ft', 29, 0
  FROM products WHERE type_key = 'stringLights' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, '20 ft', 49, 1
  FROM products WHERE type_key = 'stringLights' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, '40 ft', 59, 2
  FROM products WHERE type_key = 'stringLights' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Warm White', '#ffe8a0', 0
  FROM products WHERE type_key = 'stringLights' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Multicolor', '#e0a060', 1
  FROM products WHERE type_key = 'stringLights' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Cool White', '#e0e8f0', 2
  FROM products WHERE type_key = 'stringLights' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';

-- 45. Chandelier (chandelier)
INSERT INTO products (
  seller_id, type_key, name, label, brand, description, category, subcategory,
  status, price, price_max, rating, review_count, guarantee, is_active,
  shipping_type, weight_oz, length_in, width_in, height_in,
  primary_material, processing_days
) VALUES (
  'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9', 'chandelier', 'Chandelier', 'Chandelier', 'LightForm',
  'Crystal drops or drum shade styles. Hangs from ceiling at adjustable drop length. Hardwire installation recommended.', 'Lighting', 'Ceiling Lighting',
  'active', 299, 899, 4.4, 189,
  '3-year electrical warranty', true,
  'calculated', 46, 24, 24, 6,
  'Metal frame', 3
);
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, '18 in', 299, 0
  FROM products WHERE type_key = 'chandelier' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, '24 in', 499, 1
  FROM products WHERE type_key = 'chandelier' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, '36 in', 899, 2
  FROM products WHERE type_key = 'chandelier' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Antique Brass', '#c8a840', 0
  FROM products WHERE type_key = 'chandelier' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Matte Black', '#2a2a2a', 1
  FROM products WHERE type_key = 'chandelier' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Chrome', '#c8d0d8', 2
  FROM products WHERE type_key = 'chandelier' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';

-- 46. Pendant Light (pendant)
INSERT INTO products (
  seller_id, type_key, name, label, brand, description, category, subcategory,
  status, price, price_max, rating, review_count, guarantee, is_active,
  shipping_type, weight_oz, length_in, width_in, height_in,
  primary_material, processing_days
) VALUES (
  'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9', 'pendant', 'Pendant Light', 'Pendant Light', 'LightForm',
  'Single-shade pendant with textile or metal cord. Adjustable drop length. Available in cluster configurations.', 'Lighting', 'Ceiling Lighting',
  'active', 89, 349, 4.6, 412,
  '2-year electrical warranty', true,
  'calculated', 25, 12, 12, 4,
  'Spun metal or blown glass shade', 3
);
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, 'Mini (6 in)', 89, 0
  FROM products WHERE type_key = 'pendant' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, 'Standard (10 in)', 149, 1
  FROM products WHERE type_key = 'pendant' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, 'Statement (16 in)', 349, 2
  FROM products WHERE type_key = 'pendant' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Brass', '#c8a840', 0
  FROM products WHERE type_key = 'pendant' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Matte Black', '#2a2a2a', 1
  FROM products WHERE type_key = 'pendant' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'White', '#f0ece8', 2
  FROM products WHERE type_key = 'pendant' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Copper', '#b87040', 3
  FROM products WHERE type_key = 'pendant' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';

-- 47. Recessed Light (recessedLight)
INSERT INTO products (
  seller_id, type_key, name, label, brand, description, category, subcategory,
  status, price, price_max, rating, review_count, guarantee, is_active,
  shipping_type, weight_oz, length_in, width_in, height_in,
  primary_material, processing_days
) VALUES (
  'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9', 'recessedLight', 'Recessed Light', 'Recessed Light', 'LightForm',
  'Flush-mount recessed downlight with trim ring. LED retrofit or new construction. Dimmable. Drop length is near-zero (flush with ceiling).', 'Lighting', 'Ceiling Lighting',
  'active', 39, 119, 4.8, 1024,
  '5-year warranty', true,
  'calculated', 20, 12, 12, 1,
  'Die-cast aluminum housing', 3
);
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, '4 in', 39, 0
  FROM products WHERE type_key = 'recessedLight' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, '6 in', 59, 1
  FROM products WHERE type_key = 'recessedLight' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'White', '#f0ece8', 0
  FROM products WHERE type_key = 'recessedLight' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Nickel', '#a8a8b0', 1
  FROM products WHERE type_key = 'recessedLight' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Brass Trim', '#c8a840', 2
  FROM products WHERE type_key = 'recessedLight' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';

-- 48. Ceiling Fan (ceilingFan)
INSERT INTO products (
  seller_id, type_key, name, label, brand, description, category, subcategory,
  status, price, price_max, rating, review_count, guarantee, is_active,
  shipping_type, weight_oz, length_in, width_in, height_in,
  primary_material, processing_days
) VALUES (
  'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9', 'ceilingFan', 'Ceiling Fan', 'Ceiling Fan', 'AirForm',
  'Reversible 5-blade fan with integrated LED light kit. Remote and wall-switch compatible. Whisper-quiet DC motor.', 'Lighting', 'Ceiling Lighting',
  'active', 199, 699, 4.5, 567,
  '2-year motor warranty', true,
  'calculated', 36, 24, 24, 5,
  'ABS blades', 3
);
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, '42 in', 199, 0
  FROM products WHERE type_key = 'ceilingFan' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, '52 in', 349, 1
  FROM products WHERE type_key = 'ceilingFan' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, '60 in', 699, 2
  FROM products WHERE type_key = 'ceilingFan' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Matte White', '#e8e4e0', 0
  FROM products WHERE type_key = 'ceilingFan' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Matte Black', '#2a2a2a', 1
  FROM products WHERE type_key = 'ceilingFan' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Brushed Nickel', '#a8a8b0', 2
  FROM products WHERE type_key = 'ceilingFan' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Bronze', '#806040', 3
  FROM products WHERE type_key = 'ceilingFan' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';

-- 49. Desk Lamp (deskLamp)
INSERT INTO products (
  seller_id, type_key, name, label, brand, description, category, subcategory,
  status, price, price_max, rating, review_count, guarantee, is_active,
  shipping_type, weight_oz, length_in, width_in, height_in,
  primary_material, processing_days
) VALUES (
  'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9', 'deskLamp', 'Desk Lamp', 'Desk Lamp', 'LightForm',
  'Flexible gooseneck or articulating arm with USB-A charging port. 5 brightness levels and 3 color temperatures.', 'Lighting', 'Desk Lamps',
  'active', 49, 149, 4.7, 782,
  '2-year warranty', true,
  'calculated', 21, 12, 12, 7,
  'Aluminum arm', 3
);
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, 'Clip-On', 49, 0
  FROM products WHERE type_key = 'deskLamp' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, 'Standard', 89, 1
  FROM products WHERE type_key = 'deskLamp' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, 'Architect', 149, 2
  FROM products WHERE type_key = 'deskLamp' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Matte Black', '#2a2a2a', 0
  FROM products WHERE type_key = 'deskLamp' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Brass', '#c8a840', 1
  FROM products WHERE type_key = 'deskLamp' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'White', '#f0ece8', 2
  FROM products WHERE type_key = 'deskLamp' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';

-- 50. Wall Sconce (wallSconce)
INSERT INTO products (
  seller_id, type_key, name, label, brand, description, category, subcategory,
  status, price, price_max, rating, review_count, guarantee, is_active,
  shipping_type, weight_oz, length_in, width_in, height_in,
  primary_material, processing_days
) VALUES (
  'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9', 'wallSconce', 'Wall Sconce', 'Wall Sconce', 'LightForm',
  'Place flush against a wall. Hardwired or plug-in versions available. Great flanking a mirror or headboard.', 'Lighting', 'Wall Sconces',
  'active', 79, 199, 4.5, 267,
  '3-year electrical warranty', true,
  'calculated', 24, 12, 2, 6,
  'Cast metal arm', 3
);
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, 'Single', 79, 0
  FROM products WHERE type_key = 'wallSconce' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, 'Double Arm', 199, 1
  FROM products WHERE type_key = 'wallSconce' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Brass', '#c8a840', 0
  FROM products WHERE type_key = 'wallSconce' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Matte Black', '#2a2a2a', 1
  FROM products WHERE type_key = 'wallSconce' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Nickel', '#9898a0', 2
  FROM products WHERE type_key = 'wallSconce' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';

-- 51. Rug (rug)
INSERT INTO products (
  seller_id, type_key, name, label, brand, description, category, subcategory,
  status, price, price_max, rating, review_count, guarantee, is_active,
  shipping_type, weight_oz, length_in, width_in, height_in,
  primary_material, processing_days
) VALUES (
  'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9', 'rug', 'Rug', 'Rug', 'Threadwork',
  'Hand-tufted wool with a 0.5 in pile. Defines a space and adds warmth underfoot. Non-slip backing included.', 'Textiles', 'Rugs',
  'active', 149, 599, 4.5, 467,
  '2-year warranty', true,
  'calculated', 31, 36, 24, 1,
  '100% wool pile', 3
);
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, '5''×8''', 149, 0
  FROM products WHERE type_key = 'rug' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, '8''×10''', 299, 1
  FROM products WHERE type_key = 'rug' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, '9''×12''', 599, 2
  FROM products WHERE type_key = 'rug' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Desert Sand', '#d4b880', 0
  FROM products WHERE type_key = 'rug' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Deep Teal', '#2a7070', 1
  FROM products WHERE type_key = 'rug' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Charcoal', '#4a4a4a', 2
  FROM products WHERE type_key = 'rug' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';

-- 52. D-Shaped Rug (dRug)
INSERT INTO products (
  seller_id, type_key, name, label, brand, description, category, subcategory,
  status, price, price_max, rating, review_count, guarantee, is_active,
  shipping_type, weight_oz, length_in, width_in, height_in,
  primary_material, processing_days
) VALUES (
  'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9', 'dRug', 'D-Shaped Rug', 'D-Shaped Rug', 'Threadwork',
  'Artisan-crafted D-shaped rug with hand-knotted woven texture. The signature DaydreamDwelling silhouette for your floor.', 'Textiles', 'Rugs',
  'active', 399, 799, 4.6, 156,
  '3-year warranty', true,
  'calculated', 56, 60, 66, 1,
  '100% wool pile', 3
);
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, 'Standard 5''×5.5''', 399, 0
  FROM products WHERE type_key = 'dRug' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, 'Large 6''×6.5''', 599, 1
  FROM products WHERE type_key = 'dRug' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, 'Extra Large 7''×7.5''', 799, 2
  FROM products WHERE type_key = 'dRug' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Desert Sand', '#d4b880', 0
  FROM products WHERE type_key = 'dRug' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Deep Teal', '#2a7070', 1
  FROM products WHERE type_key = 'dRug' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Lavender', '#b898c4', 2
  FROM products WHERE type_key = 'dRug' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';

-- 53. Throw Pillow (throwPillow)
INSERT INTO products (
  seller_id, type_key, name, label, brand, description, category, subcategory,
  status, price, price_max, rating, review_count, guarantee, is_active,
  shipping_type, weight_oz, length_in, width_in, height_in,
  primary_material, processing_days
) VALUES (
  'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9', 'throwPillow', 'Throw Pillow', 'Throw Pillow', 'The Cozy Co',
  'Double-sided with removable zip covers. Sold individually — mix and match for a curated sofa look.', 'Textiles', 'Pillows',
  'active', 29, 79, 4.7, 1203,
  '1-year warranty', true,
  'calculated', 19, 12, 12, 2,
  'Linen or velvet cover', 3
);
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, '18×18 in', 29, 0
  FROM products WHERE type_key = 'throwPillow' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, '20×20 in', 39, 1
  FROM products WHERE type_key = 'throwPillow' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, 'Lumbar', 79, 2
  FROM products WHERE type_key = 'throwPillow' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Dusty Rose', '#d4a0a0', 0
  FROM products WHERE type_key = 'throwPillow' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Sage', '#8aa880', 1
  FROM products WHERE type_key = 'throwPillow' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Cream', '#e8e0d0', 2
  FROM products WHERE type_key = 'throwPillow' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';

-- 54. Curtains (curtains)
INSERT INTO products (
  seller_id, type_key, name, label, brand, description, category, subcategory,
  status, price, price_max, rating, review_count, guarantee, is_active,
  shipping_type, weight_oz, length_in, width_in, height_in,
  primary_material, processing_days
) VALUES (
  'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9', 'curtains', 'Curtains', 'Curtains', 'Threadwork',
  'Place flush against a wall to simulate window treatment. Sold as a pair. Grommeted top fits standard rods.', 'Textiles', 'Curtains',
  'active', 79, 199, 4.4, 288,
  '1-year warranty', true,
  'calculated', 24, 24, 1, 30,
  '100% linen blend', 3
);
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, '52×84 in', 79, 0
  FROM products WHERE type_key = 'curtains' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, '52×96 in', 99, 1
  FROM products WHERE type_key = 'curtains' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, '100×108 in', 199, 2
  FROM products WHERE type_key = 'curtains' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Linen Natural', '#d8c8a0', 0
  FROM products WHERE type_key = 'curtains' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Cloud White', '#f4f0ea', 1
  FROM products WHERE type_key = 'curtains' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Midnight', '#2a2a3a', 2
  FROM products WHERE type_key = 'curtains' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';

-- 55. Runner Rug (runnerRug)
INSERT INTO products (
  seller_id, type_key, name, label, brand, description, category, subcategory,
  status, price, price_max, rating, review_count, guarantee, is_active,
  shipping_type, weight_oz, length_in, width_in, height_in,
  primary_material, processing_days
) VALUES (
  'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9', 'runnerRug', 'Runner Rug', 'Runner Rug', 'Threadwork',
  'Narrow-format rug sized for hallways and entryways. Non-slip backing included. Hand-knotted fringe at each end.', 'Textiles', 'Runner Rugs',
  'active', 89, 229, 4.6, 312,
  '2-year warranty', true,
  'calculated', 25, 12, 36, 1,
  '80% wool / 20% cotton', 3
);
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, '2''×6''', 89, 0
  FROM products WHERE type_key = 'runnerRug' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, '2''×8''', 139, 1
  FROM products WHERE type_key = 'runnerRug' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, '2''×12''', 229, 2
  FROM products WHERE type_key = 'runnerRug' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Camel', '#c8a060', 0
  FROM products WHERE type_key = 'runnerRug' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Navy', '#2a3a5a', 1
  FROM products WHERE type_key = 'runnerRug' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Charcoal', '#4a4a4a', 2
  FROM products WHERE type_key = 'runnerRug' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';

-- 56. Throw Blanket (throwBlanket)
INSERT INTO products (
  seller_id, type_key, name, label, brand, description, category, subcategory,
  status, price, price_max, rating, review_count, guarantee, is_active,
  shipping_type, weight_oz, length_in, width_in, height_in,
  primary_material, processing_days
) VALUES (
  'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9', 'throwBlanket', 'Throw Blanket', 'Throw Blanket', 'The Cozy Co',
  'A chunky knit or waffle-weave throw for draping over sofas and beds. Shown folded — looks best casually draped.', 'Textiles', 'Throw Blankets',
  'active', 39, 119, 4.9, 1847,
  '30-day return', true,
  'calculated', 20, 12, 12, 1,
  '100% merino wool or cotton', 3
);
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, '50×60 in', 39, 0
  FROM products WHERE type_key = 'throwBlanket' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, '60×80 in', 79, 1
  FROM products WHERE type_key = 'throwBlanket' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, 'Weighted', 119, 2
  FROM products WHERE type_key = 'throwBlanket' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Oatmeal', '#e0d0b8', 0
  FROM products WHERE type_key = 'throwBlanket' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Slate Blue', '#7888a0', 1
  FROM products WHERE type_key = 'throwBlanket' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Dusty Rose', '#c8a0a8', 2
  FROM products WHERE type_key = 'throwBlanket' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';

-- 57. Door (door)
INSERT INTO products (
  seller_id, type_key, name, label, brand, description, category, subcategory,
  status, price, price_max, rating, review_count, guarantee, is_active,
  shipping_type, weight_oz, length_in, width_in, height_in,
  primary_material, processing_days
) VALUES (
  'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9', 'door', 'Door', 'Door', 'FrameWorks',
  'Solid-core interior door with pre-hung frame. Includes hinges and latch hardware. Compatible with standard rough openings.', 'Doors', 'Interior Doors',
  'active', 299, 699, 4.6, 312,
  '10-year structural warranty', true,
  'calculated', 46, 32, 3, 80,
  'Solid pine core', 3
);
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, 'Narrow 2''0"×6''8"', 249, 0
  FROM products WHERE type_key = 'door' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, 'Standard 2''8"×6''8"', 349, 1
  FROM products WHERE type_key = 'door' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, 'Wide 3''0"×6''8"', 449, 2
  FROM products WHERE type_key = 'door' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, 'Double 5''0"×6''8"', 699, 3
  FROM products WHERE type_key = 'door' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Oak', '#c8a870', 0
  FROM products WHERE type_key = 'door' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'White', '#f0ece4', 1
  FROM products WHERE type_key = 'door' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Walnut', '#6a4a2a', 2
  FROM products WHERE type_key = 'door' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';

-- 58. Entryway Door (entryway_door)
INSERT INTO products (
  seller_id, type_key, name, label, brand, description, category, subcategory,
  status, price, price_max, rating, review_count, guarantee, is_active,
  shipping_type, weight_oz, length_in, width_in, height_in,
  primary_material, processing_days
) VALUES (
  'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9', 'entryway_door', 'Entryway Door', 'Entryway Door', 'FrameWorks',
  'Solid exterior door with weatherstripping, deadbolt prep, and insulated core. Represents the main building entry point — does not connect to another interior room.', 'Doors', 'Exterior Doors',
  'active', 449, 999, 4.7, 198,
  '10-year structural warranty', true,
  'calculated', 61, 36, 3, 84,
  'Solid wood or steel core', 3
);
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, 'Single 3''0"×7''0"', 449, 0
  FROM products WHERE type_key = 'entryway_door' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, 'Wide 3''6"×7''0"', 599, 1
  FROM products WHERE type_key = 'entryway_door' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, 'Double 6''0"×7''0"', 999, 2
  FROM products WHERE type_key = 'entryway_door' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Mahogany', '#7a3010', 0
  FROM products WHERE type_key = 'entryway_door' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Black', '#1a1a1a', 1
  FROM products WHERE type_key = 'entryway_door' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'White', '#f0ece4', 2
  FROM products WHERE type_key = 'entryway_door' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Steel', '#5a6a7a', 3
  FROM products WHERE type_key = 'entryway_door' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';

-- 59. Window (window)
INSERT INTO products (
  seller_id, type_key, name, label, brand, description, category, subcategory,
  status, price, price_max, rating, review_count, guarantee, is_active,
  shipping_type, weight_oz, length_in, width_in, height_in,
  primary_material, processing_days
) VALUES (
  'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9', 'window', 'Window', 'Window', 'FrameWorks',
  'Single-hung window with insulated double-pane glass and wood-composite frame. Compatible with interior trim kits.', 'Windows', 'Single Hung',
  'active', 399, 899, 4.4, 156,
  '25-year warranty on glass seal', true,
  'calculated', 56, 36, 3, 48,
  'Wood-composite frame', 3
);
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, 'Small 2''×3''', 399, 0
  FROM products WHERE type_key = 'window' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, 'Standard 3''×4''', 599, 1
  FROM products WHERE type_key = 'window' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, 'Large 4''×5''', 899, 2
  FROM products WHERE type_key = 'window' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Clear', '#c0e8ff', 0
  FROM products WHERE type_key = 'window' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Frosted', '#dceef5', 1
  FROM products WHERE type_key = 'window' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Tinted', '#90b8d8', 2
  FROM products WHERE type_key = 'window' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';

-- 60. D-Shaped Window (dWindow)
INSERT INTO products (
  seller_id, type_key, name, label, brand, description, category, subcategory,
  status, price, price_max, rating, review_count, guarantee, is_active,
  shipping_type, weight_oz, length_in, width_in, height_in,
  primary_material, processing_days
) VALUES (
  'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9', 'dWindow', 'D-Shaped Window', 'D-Shaped Window', 'FrameWorks',
  'The signature DaydreamDwelling D-shaped arch window. Elegant curved silhouette with wooden frame and dual-pane glass.', 'Windows', 'Arched',
  'active', 599, 1199, 4.7, 87,
  '25-year warranty on glass seal', true,
  'calculated', 76, 54, 3, 66,
  'Wood-composite frame', 3
);
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, 'Standard 4.5''×5.5''', 599, 0
  FROM products WHERE type_key = 'dWindow' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, 'Large 5.5''×6.5''', 899, 1
  FROM products WHERE type_key = 'dWindow' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, 'Extra Large 6''×7''', 1199, 2
  FROM products WHERE type_key = 'dWindow' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Clear', '#c0e8ff', 0
  FROM products WHERE type_key = 'dWindow' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Frosted', '#dceef5', 1
  FROM products WHERE type_key = 'dWindow' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Tinted', '#b8a0d0', 2
  FROM products WHERE type_key = 'dWindow' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';

-- 61. Plant (plant)
INSERT INTO products (
  seller_id, type_key, name, label, brand, description, category, subcategory,
  status, price, price_max, rating, review_count, guarantee, is_active,
  shipping_type, weight_oz, length_in, width_in, height_in,
  primary_material, processing_days
) VALUES (
  'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9', 'plant', 'Plant', 'Plant', 'GreenSpace',
  'A lush indoor plant in a handmade ceramic pot. Each pot is slightly unique. Variety ships based on season.', 'Decor', 'Plants',
  'active', 49, 99, 4.9, 532,
  '30-day plant health guarantee', true,
  'calculated', 21, 12, 12, 18,
  'Handmade ceramic pot', 3
);
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, 'Small', 49, 0
  FROM products WHERE type_key = 'plant' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, 'Large', 99, 1
  FROM products WHERE type_key = 'plant' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Terracotta', '#c4785a', 0
  FROM products WHERE type_key = 'plant' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Cream', '#f0ece0', 1
  FROM products WHERE type_key = 'plant' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Matte Black', '#2a2a2a', 2
  FROM products WHERE type_key = 'plant' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';

-- 62. Vase (vase)
INSERT INTO products (
  seller_id, type_key, name, label, brand, description, category, subcategory,
  status, price, price_max, rating, review_count, guarantee, is_active,
  shipping_type, weight_oz, length_in, width_in, height_in,
  primary_material, processing_days
) VALUES (
  'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9', 'vase', 'Vase', 'Vase', 'Clay & Form',
  'Wheel-thrown by hand, each vase has its own personality. Fill with dried pampas, fresh florals, or nothing at all.', 'Decor', 'Vases',
  'active', 39, 119, 4.7, 387,
  '30-day satisfaction guarantee', true,
  'calculated', 20, 12, 12, 12,
  'High-fire stoneware', 3
);
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, 'Bud', 39, 0
  FROM products WHERE type_key = 'vase' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, 'Standard', 69, 1
  FROM products WHERE type_key = 'vase' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, 'Floor', 119, 2
  FROM products WHERE type_key = 'vase' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Terracotta', '#c4785a', 0
  FROM products WHERE type_key = 'vase' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Sage', '#8a9878', 1
  FROM products WHERE type_key = 'vase' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Ivory', '#f0e8d8', 2
  FROM products WHERE type_key = 'vase' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';

-- 63. Candle (candle)
INSERT INTO products (
  seller_id, type_key, name, label, brand, description, category, subcategory,
  status, price, price_max, rating, review_count, guarantee, is_active,
  shipping_type, weight_oz, length_in, width_in, height_in,
  primary_material, processing_days
) VALUES (
  'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9', 'candle', 'Candle', 'Candle', 'Ember & Wick',
  'Hand-poured soy-coconut wax with lead-free cotton wicks. 50+ hours of clean burn per candle.', 'Decor', 'Candles',
  'active', 24, 68, 4.8, 1089,
  '100% satisfaction guarantee', true,
  'calculated', 18, 12, 12, 6,
  'Soy-coconut wax blend', 3
);
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, '4 oz', 24, 0
  FROM products WHERE type_key = 'candle' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, '8 oz', 42, 1
  FROM products WHERE type_key = 'candle' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, 'Pillar', 68, 2
  FROM products WHERE type_key = 'candle' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Cashmere', '#e8d8b0', 0
  FROM products WHERE type_key = 'candle' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Black Fig', '#3a2a3a', 1
  FROM products WHERE type_key = 'candle' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Sea Salt', '#b8d8e8', 2
  FROM products WHERE type_key = 'candle' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';

-- 64. Sculpture (sculpture)
INSERT INTO products (
  seller_id, type_key, name, label, brand, description, category, subcategory,
  status, price, price_max, rating, review_count, guarantee, is_active,
  shipping_type, weight_oz, length_in, width_in, height_in,
  primary_material, processing_days
) VALUES (
  'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9', 'sculpture', 'Sculpture', 'Sculpture', 'Clay & Form',
  'Hand-cast resin or ceramic abstract form. Each one is slightly different. Makes a statement on a shelf, console, or the floor.', 'Decor', 'Sculptures',
  'active', 89, 349, 4.7, 213,
  '30-day satisfaction guarantee', true,
  'calculated', 25, 12, 12, 10,
  'Resin or ceramic', 3
);
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, 'Tabletop', 89, 0
  FROM products WHERE type_key = 'sculpture' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, 'Floor', 219, 1
  FROM products WHERE type_key = 'sculpture' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, 'Statement', 349, 2
  FROM products WHERE type_key = 'sculpture' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Ivory', '#f0e8d8', 0
  FROM products WHERE type_key = 'sculpture' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Terracotta', '#c87858', 1
  FROM products WHERE type_key = 'sculpture' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Obsidian', '#2a2828', 2
  FROM products WHERE type_key = 'sculpture' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';

-- 65. Decorative Books (bookStack)
INSERT INTO products (
  seller_id, type_key, name, label, brand, description, category, subcategory,
  status, price, price_max, rating, review_count, guarantee, is_active,
  shipping_type, weight_oz, length_in, width_in, height_in,
  primary_material, processing_days
) VALUES (
  'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9', 'bookStack', 'Decorative Books', 'Decorative Books', 'Studio PAPER',
  'Curated sets of hardcover coffee table books coordinated by color. Use as a tray base, stack on a shelf, or display as art.', 'Decor', 'Book Displays',
  'active', 35, 89, 4.8, 934,
  '30-day return', true,
  'calculated', 20, 12, 12, 4,
  'Hardcover books', 3
);
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, 'Stack of 3', 35, 0
  FROM products WHERE type_key = 'bookStack' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, 'Stack of 5', 59, 1
  FROM products WHERE type_key = 'bookStack' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, 'Row', 89, 2
  FROM products WHERE type_key = 'bookStack' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Neutral Tones', '#c8c0b0', 0
  FROM products WHERE type_key = 'bookStack' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Dark Academia', '#5a4a3a', 1
  FROM products WHERE type_key = 'bookStack' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Pastels', '#b8c8d8', 2
  FROM products WHERE type_key = 'bookStack' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';

-- 66. Decorative Tray (tray)
INSERT INTO products (
  seller_id, type_key, name, label, brand, description, category, subcategory,
  status, price, price_max, rating, review_count, guarantee, is_active,
  shipping_type, weight_oz, length_in, width_in, height_in,
  primary_material, processing_days
) VALUES (
  'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9', 'tray', 'Decorative Tray', 'Decorative Tray', 'Clay & Form',
  'Corrals candles, remotes, and small decor into a styled moment. Stacks well. Mix materials for maximum impact.', 'Decor', 'Trays',
  'active', 29, 79, 4.6, 567,
  '30-day return', true,
  'calculated', 19, 12, 12, 1,
  'Marble, brass, or powder-coated steel', 3
);
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, '10 in Round', 29, 0
  FROM products WHERE type_key = 'tray' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, '14×10 in', 49, 1
  FROM products WHERE type_key = 'tray' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, '18×12 in', 79, 2
  FROM products WHERE type_key = 'tray' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Marble', '#f0ece8', 0
  FROM products WHERE type_key = 'tray' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Brass', '#c8a840', 1
  FROM products WHERE type_key = 'tray' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Matte Black', '#2a2a2a', 2
  FROM products WHERE type_key = 'tray' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';

-- 67. Reed Diffuser (diffuser)
INSERT INTO products (
  seller_id, type_key, name, label, brand, description, category, subcategory,
  status, price, price_max, rating, review_count, guarantee, is_active,
  shipping_type, weight_oz, length_in, width_in, height_in,
  primary_material, processing_days
) VALUES (
  'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9', 'diffuser', 'Reed Diffuser', 'Reed Diffuser', 'Ember & Wick',
  'Rattan reeds pull fragrance oil up and diffuse scent naturally for 8–12 weeks. Flip the reeds weekly for a stronger throw.', 'Decor', 'Scent & Ambiance',
  'active', 38, 88, 4.8, 721,
  '100% satisfaction guarantee', true,
  'calculated', 20, 12, 12, 5,
  'Glass vessel', 3
);
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, '3 oz', 38, 0
  FROM products WHERE type_key = 'diffuser' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, '6 oz', 58, 1
  FROM products WHERE type_key = 'diffuser' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, '10 oz', 88, 2
  FROM products WHERE type_key = 'diffuser' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Clear Glass', '#e8f0f0', 0
  FROM products WHERE type_key = 'diffuser' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Amber Glass', '#c89040', 1
  FROM products WHERE type_key = 'diffuser' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Frosted', '#e0e8e8', 2
  FROM products WHERE type_key = 'diffuser' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';

-- 68. Wall Decal (wallDecal)
INSERT INTO products (
  seller_id, type_key, name, label, brand, description, category, subcategory,
  status, price, price_max, rating, review_count, guarantee, is_active,
  shipping_type, weight_oz, length_in, width_in, height_in,
  primary_material, processing_days
) VALUES (
  'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9', 'wallDecal', 'Wall Decal', 'Wall Decal', 'DecalCo',
  'Removable vinyl wall decals — no paint damage when removed. Apply in minutes, reposition for a year, remove cleanly.', 'Decor', 'Wall Decals',
  'active', 18, 69, 4.7, 1204,
  '100% removable guarantee', true,
  'calculated', 18, 12, 1, 10,
  'Removable vinyl', 3
);
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, 'Small (12 in)', 18, 0
  FROM products WHERE type_key = 'wallDecal' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, 'Medium (24 in)', 35, 1
  FROM products WHERE type_key = 'wallDecal' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, 'Large (48 in)', 69, 2
  FROM products WHERE type_key = 'wallDecal' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Matte Black', '#2a2a2a', 0
  FROM products WHERE type_key = 'wallDecal' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Gold Foil', '#c8a840', 1
  FROM products WHERE type_key = 'wallDecal' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'White', '#f4f0ea', 2
  FROM products WHERE type_key = 'wallDecal' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';

-- 69. Fabric Banner (banner)
INSERT INTO products (
  seller_id, type_key, name, label, brand, description, category, subcategory,
  status, price, price_max, rating, review_count, guarantee, is_active,
  shipping_type, weight_oz, length_in, width_in, height_in,
  primary_material, processing_days
) VALUES (
  'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9', 'banner', 'Fabric Banner', 'Fabric Banner', 'Boho Nest',
  'Hand-dyed cotton pennant banner or letter garland. Strings on jute twine. Great for mantels, headboards, and gallery walls.', 'Decor', 'Banners',
  'active', 24, 59, 4.6, 487,
  '30-day return', true,
  'calculated', 18, 24, 1, 7,
  '100% cotton flags', 3
);
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, '6 ft Garland', 24, 0
  FROM products WHERE type_key = 'banner' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, '12 ft Garland', 39, 1
  FROM products WHERE type_key = 'banner' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, 'Flag Banner', 59, 2
  FROM products WHERE type_key = 'banner' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Neutral', '#e8d8a8', 0
  FROM products WHERE type_key = 'banner' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Colorful', '#e8a840', 1
  FROM products WHERE type_key = 'banner' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Minimalist', '#c8c8c8', 2
  FROM products WHERE type_key = 'banner' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';

-- 70. Picture Frame (pictureFrame)
INSERT INTO products (
  seller_id, type_key, name, label, brand, description, category, subcategory,
  status, price, price_max, rating, review_count, guarantee, is_active,
  shipping_type, weight_oz, length_in, width_in, height_in,
  primary_material, processing_days
) VALUES (
  'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9', 'pictureFrame', 'Picture Frame', 'Picture Frame', 'Studio PAPER',
  'Solid wood or metal frame with real glass. Place against a wall or use the included easel back for tabletop display.', 'Decor', 'Picture Frames',
  'active', 22, 89, 4.5, 823,
  '2-year warranty', true,
  'calculated', 18, 12, 1, 10,
  'Solid wood or cast metal', 3
);
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, '4×6 in', 22, 0
  FROM products WHERE type_key = 'pictureFrame' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, '8×10 in', 39, 1
  FROM products WHERE type_key = 'pictureFrame' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, '11×14 in', 89, 2
  FROM products WHERE type_key = 'pictureFrame' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Natural Wood', '#c4a060', 0
  FROM products WHERE type_key = 'pictureFrame' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Matte Black', '#2a2a2a', 1
  FROM products WHERE type_key = 'pictureFrame' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Antique Gold', '#c8a030', 2
  FROM products WHERE type_key = 'pictureFrame' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';

-- 71. Terrarium (terrarium)
INSERT INTO products (
  seller_id, type_key, name, label, brand, description, category, subcategory,
  status, price, price_max, rating, review_count, guarantee, is_active,
  shipping_type, weight_oz, length_in, width_in, height_in,
  primary_material, processing_days
) VALUES (
  'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9', 'terrarium', 'Terrarium', 'Terrarium', 'GreenSpace',
  'Geometric glass enclosure with hand-selected air plants, moss, and stone inside. Sealed lid keeps moisture in. Zero maintenance.', 'Decor', 'Terrariums',
  'active', 65, 149, 4.8, 356,
  '30-day plant health guarantee', true,
  'calculated', 23, 12, 12, 8,
  'Geometric glass & metal frame', 3
);
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, 'Mini', 65, 0
  FROM products WHERE type_key = 'terrarium' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, 'Standard', 99, 1
  FROM products WHERE type_key = 'terrarium' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, 'Tall', 149, 2
  FROM products WHERE type_key = 'terrarium' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Clear Glass', '#d8e8e8', 0
  FROM products WHERE type_key = 'terrarium' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Amber Glass', '#c89040', 1
  FROM products WHERE type_key = 'terrarium' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Geometric', '#b8c8a8', 2
  FROM products WHERE type_key = 'terrarium' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';

-- 72. Gaming Chair (gamingChair)
INSERT INTO products (
  seller_id, type_key, name, label, brand, description, category, subcategory,
  status, price, price_max, rating, review_count, guarantee, is_active,
  shipping_type, weight_oz, length_in, width_in, height_in,
  primary_material, processing_days
) VALUES (
  'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9', 'gamingChair', 'Gaming Chair', 'Gaming Chair', 'ProRace Gaming',
  'Lumbar + neck pillow included. 4D armrests, 180° recline, and a steel frame rated for 300 lb.', 'Specialty', 'Gaming',
  'active', 299, 599, 4.3, 728,
  '2-year warranty', true,
  'calculated', 46, 12, 24, 22,
  'Cold-cured foam', 3
);
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, 'Standard', 299, 0
  FROM products WHERE type_key = 'gamingChair' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, 'XL', 599, 1
  FROM products WHERE type_key = 'gamingChair' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Black & Red', '#3a1a1a', 0
  FROM products WHERE type_key = 'gamingChair' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Black & Blue', '#1a2a4a', 1
  FROM products WHERE type_key = 'gamingChair' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'All Black', '#1a1a1a', 2
  FROM products WHERE type_key = 'gamingChair' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';

-- 73. Gaming Desk (gamingDesk)
INSERT INTO products (
  seller_id, type_key, name, label, brand, description, category, subcategory,
  status, price, price_max, rating, review_count, guarantee, is_active,
  shipping_type, weight_oz, length_in, width_in, height_in,
  primary_material, processing_days
) VALUES (
  'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9', 'gamingDesk', 'Gaming Desk', 'Gaming Desk', 'ProRace Gaming',
  'RGB LED underglow, built-in headphone hook, cable management tray, and a monitor riser shelf.', 'Specialty', 'Gaming',
  'active', 349, 599, 4.5, 412,
  '3-year warranty', true,
  'calculated', 51, 36, 24, 12,
  'Carbon fiber texture surface', 3
);
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, '55 in', 349, 0
  FROM products WHERE type_key = 'gamingDesk' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, 'Corner', 599, 1
  FROM products WHERE type_key = 'gamingDesk' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Carbon Black', '#1a1a1a', 0
  FROM products WHERE type_key = 'gamingDesk' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'White', '#f0f0f0', 1
  FROM products WHERE type_key = 'gamingDesk' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';

-- 74. Kids Storage Cubby (kidsStorage)
INSERT INTO products (
  seller_id, type_key, name, label, brand, description, category, subcategory,
  status, price, price_max, rating, review_count, guarantee, is_active,
  shipping_type, weight_oz, length_in, width_in, height_in,
  primary_material, processing_days
) VALUES (
  'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9', 'kidsStorage', 'Kids Storage Cubby', 'Kids Storage Cubby', 'Playroom Co',
  'Round-edge shelving with fabric bin inserts. No sharp corners, tip-resistant wall anchor included.', 'Specialty', 'Kids',
  'active', 179, 299, 4.7, 589,
  '3-year warranty', true,
  'calculated', 34, 24, 12, 18,
  'TSCA-certified MDF', 3
);
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, '4-Cube', 179, 0
  FROM products WHERE type_key = 'kidsStorage' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, '9-Cube', 299, 1
  FROM products WHERE type_key = 'kidsStorage' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Rainbow', '#e88840', 0
  FROM products WHERE type_key = 'kidsStorage' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Pastels', '#a8d0e8', 1
  FROM products WHERE type_key = 'kidsStorage' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Natural', '#d4b880', 2
  FROM products WHERE type_key = 'kidsStorage' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';

-- 75. Bar Cart (barCart)
INSERT INTO products (
  seller_id, type_key, name, label, brand, description, category, subcategory,
  status, price, price_max, rating, review_count, guarantee, is_active,
  shipping_type, weight_oz, length_in, width_in, height_in,
  primary_material, processing_days
) VALUES (
  'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9', 'barCart', 'Bar Cart', 'Bar Cart', 'Forma Studio',
  'A rolling bar cart with two or three wire shelves. Wine glass holders on the lower shelf. Locking casters.', 'Specialty', 'Bar & Entertaining',
  'active', 199, 449, 4.6, 312,
  '3-year warranty', true,
  'calculated', 36, 24, 12, 13,
  'Powder-coated steel frame', 3
);
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, '2-Tier', 199, 0
  FROM products WHERE type_key = 'barCart' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, '3-Tier', 299, 1
  FROM products WHERE type_key = 'barCart' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, 'Cabinet', 449, 2
  FROM products WHERE type_key = 'barCart' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Brass', '#c8a840', 0
  FROM products WHERE type_key = 'barCart' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Matte Black', '#2a2a2a', 1
  FROM products WHERE type_key = 'barCart' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Chrome', '#b8c0c8', 2
  FROM products WHERE type_key = 'barCart' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';

-- 76. Electric Fireplace (fireplace)
INSERT INTO products (
  seller_id, type_key, name, label, brand, description, category, subcategory,
  status, price, price_max, rating, review_count, guarantee, is_active,
  shipping_type, weight_oz, length_in, width_in, height_in,
  primary_material, processing_days
) VALUES (
  'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9', 'fireplace', 'Electric Fireplace', 'Electric Fireplace', 'HomeBase',
  'Plug-in electric fireplace insert with a realistic LED flame effect and adjustable heat output. No venting or gas line required.', 'Specialty', 'Fireplaces',
  'active', 399, 899, 4.5, 428,
  '3-year warranty', true,
  'calculated', 56, 36, 12, 14,
  'MDF surround', 3
);
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, '42 in Wall', 399, 0
  FROM products WHERE type_key = 'fireplace' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, '60 in Wall', 599, 1
  FROM products WHERE type_key = 'fireplace' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, 'Corner Unit', 899, 2
  FROM products WHERE type_key = 'fireplace' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'White Surround', '#f4f0ea', 0
  FROM products WHERE type_key = 'fireplace' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Black Surround', '#2a2a2a', 1
  FROM products WHERE type_key = 'fireplace' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Dark Oak', '#5a3a18', 2
  FROM products WHERE type_key = 'fireplace' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';

-- 77. Yoga & Fitness Corner (fitnessEquipment)
INSERT INTO products (
  seller_id, type_key, name, label, brand, description, category, subcategory,
  status, price, price_max, rating, review_count, guarantee, is_active,
  shipping_type, weight_oz, length_in, width_in, height_in,
  primary_material, processing_days
) VALUES (
  'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9', 'fitnessEquipment', 'Yoga & Fitness Corner', 'Yoga & Fitness Corner', 'ActiveSpace',
  'A dedicated floor zone for stretching and movement. The full setup includes a mat, two blocks, a strap, and a bolster.', 'Specialty', 'Fitness',
  'active', 99, 299, 4.7, 589,
  '1-year warranty', true,
  'calculated', 26, 24, 36, 1,
  '6mm natural rubber mat', 3
);
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, 'Yoga Mat', 99, 0
  FROM products WHERE type_key = 'fitnessEquipment' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, 'Mat + Blocks', 159, 1
  FROM products WHERE type_key = 'fitnessEquipment' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, 'Full Setup', 299, 2
  FROM products WHERE type_key = 'fitnessEquipment' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Muted Blue', '#6888a8', 0
  FROM products WHERE type_key = 'fitnessEquipment' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Forest', '#4a7858', 1
  FROM products WHERE type_key = 'fitnessEquipment' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Charcoal', '#4a4a4a', 2
  FROM products WHERE type_key = 'fitnessEquipment' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';

-- 78. Seasonal Decor Set (seasonalDecor)
INSERT INTO products (
  seller_id, type_key, name, label, brand, description, category, subcategory,
  status, price, price_max, rating, review_count, guarantee, is_active,
  shipping_type, weight_oz, length_in, width_in, height_in,
  primary_material, processing_days
) VALUES (
  'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9', 'seasonalDecor', 'Seasonal Decor Set', 'Seasonal Decor Set', 'Seasonal Studio',
  'Swappable seasonal accent pieces — a coordinated collection updated four times a year.', 'Specialty', 'Seasonal',
  'active', 49, 129, 4.6, 234,
  '30-day return', true,
  'calculated', 21, 12, 12, 10,
  'Mixed natural & synthetic', 3
);
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, 'Small Set', 49, 0
  FROM products WHERE type_key = 'seasonalDecor' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, 'Large Set', 129, 1
  FROM products WHERE type_key = 'seasonalDecor' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Fall Harvest', '#c85a30', 0
  FROM products WHERE type_key = 'seasonalDecor' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Winter Snow', '#a0c8e8', 1
  FROM products WHERE type_key = 'seasonalDecor' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Spring Bloom', '#d0a8c8', 2
  FROM products WHERE type_key = 'seasonalDecor' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';

-- 79. Grab Bar (grabBar)
INSERT INTO products (
  seller_id, type_key, name, label, brand, description, category, subcategory,
  status, price, price_max, rating, review_count, guarantee, is_active,
  shipping_type, weight_oz, length_in, width_in, height_in,
  primary_material, processing_days
) VALUES (
  'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9', 'grabBar', 'Grab Bar', 'Grab Bar', '',
  'ADA-compliant stainless steel grab bar. Supports 250 lb. Angled or straight mount. Required in accessible bathrooms near toilet and shower.', 'Structure', 'Accessibility',
  'active', 79, 149, 4.7, 88,
  'Lifetime warranty', true,
  'calculated', 24, 18, 1, 2,
  '18-gauge stainless steel', 3
);
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, '18 in', 79, 0
  FROM products WHERE type_key = 'grabBar' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, '24 in', 99, 1
  FROM products WHERE type_key = 'grabBar' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, '36 in', 149, 2
  FROM products WHERE type_key = 'grabBar' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Brushed Nickel', '#b0b8c0', 0
  FROM products WHERE type_key = 'grabBar' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Matte Black', '#2a2a2a', 1
  FROM products WHERE type_key = 'grabBar' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Chrome', '#d0d8e0', 2
  FROM products WHERE type_key = 'grabBar' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';

-- 80. Closet Rod (closetRod)
INSERT INTO products (
  seller_id, type_key, name, label, brand, description, category, subcategory,
  status, price, price_max, rating, review_count, guarantee, is_active,
  shipping_type, weight_oz, length_in, width_in, height_in,
  primary_material, processing_days
) VALUES (
  'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9', 'closetRod', 'Closet Rod', 'Closet Rod', '',
  'Adjustable-diameter closet rod with bracket flanges. Mounts to walls or custom wardrobe units. Supports up to 40 lb of hanging garments.', 'Storage', 'Closet Systems',
  'active', 29, 79, 4.5, 312,
  '2-year warranty', true,
  'calculated', 19, 36, 2, 1,
  'Heavy-gauge steel', 3
);
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, '24 in', 29, 0
  FROM products WHERE type_key = 'closetRod' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, '36 in', 39, 1
  FROM products WHERE type_key = 'closetRod' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, '48 in', 59, 2
  FROM products WHERE type_key = 'closetRod' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, '60 in', 79, 3
  FROM products WHERE type_key = 'closetRod' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Chrome', '#c8d0d8', 0
  FROM products WHERE type_key = 'closetRod' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Matte Black', '#2a2a2a', 1
  FROM products WHERE type_key = 'closetRod' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Brushed Gold', '#c8a840', 2
  FROM products WHERE type_key = 'closetRod' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';

-- 81. Closet Shelf (closetShelf)
INSERT INTO products (
  seller_id, type_key, name, label, brand, description, category, subcategory,
  status, price, price_max, rating, review_count, guarantee, is_active,
  shipping_type, weight_oz, length_in, width_in, height_in,
  primary_material, processing_days
) VALUES (
  'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9', 'closetShelf', 'Closet Shelf', 'Closet Shelf', '',
  'Adjustable wire or laminate shelf for walk-in and reach-in closets. Stackable system mounts on standard closet track standards.', 'Storage', 'Closet Systems',
  'active', 39, 99, 4.4, 201,
  '5-year warranty', true,
  'calculated', 20, 36, 12, 2,
  'Vinyl-coated wire or laminate board', 3
);
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, '24 in', 39, 0
  FROM products WHERE type_key = 'closetShelf' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, '36 in', 59, 1
  FROM products WHERE type_key = 'closetShelf' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, '48 in', 79, 2
  FROM products WHERE type_key = 'closetShelf' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, '60 in', 99, 3
  FROM products WHERE type_key = 'closetShelf' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'White', '#f0ece4', 0
  FROM products WHERE type_key = 'closetShelf' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Natural Wood', '#d4b880', 1
  FROM products WHERE type_key = 'closetShelf' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';
INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, 'Dark Walnut', '#5a3a1a', 2
  FROM products WHERE type_key = 'closetShelf' AND seller_id = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9';

