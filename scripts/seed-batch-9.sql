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


