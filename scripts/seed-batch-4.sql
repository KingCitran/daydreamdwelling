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

