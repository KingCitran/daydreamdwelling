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

