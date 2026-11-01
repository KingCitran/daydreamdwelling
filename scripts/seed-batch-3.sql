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

