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

