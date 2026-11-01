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

