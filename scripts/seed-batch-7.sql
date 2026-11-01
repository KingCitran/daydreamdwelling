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

