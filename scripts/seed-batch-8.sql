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

