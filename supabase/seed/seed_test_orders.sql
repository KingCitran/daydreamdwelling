-- =====================================================
-- TEST ORDER SEED — run AFTER migration 024_order_fulfillment_columns.sql.
--
-- Replace the placeholder below with YOUR seller user UID.
-- Find it in Supabase → Authentication → Users → click your email →
-- copy the "User UID" value.
--
-- This script:
--   1. Creates 4 simple test products under your seller account, identified
--      by SEED_TEST_ name prefix so the cleanup step can find them
--   2. Creates 6 orders in varied states so the seller OrdersPage shows
--      a realistic mix — different fulfillment stages, paid + pending,
--      logged-in + guest buyers, with/without tracking numbers
--
-- Re-runnable: deletes its own previous seed rows before inserting (uses
-- stripe_payment_id prefixed with 'seed_test_' and name prefix 'SEED_TEST_'
-- to identify them).
-- =====================================================

do $$
declare
  seller_uid uuid := '00000000-0000-0000-0000-000000000000'; -- ← REPLACE THIS

  prod1 uuid; prod2 uuid; prod3 uuid; prod4 uuid;
  order1 uuid; order2 uuid; order3 uuid; order4 uuid; order5 uuid; order6 uuid;
begin
  if seller_uid::text = '00000000-0000-0000-0000-000000000000' then
    raise exception 'Replace seller_uid with your actual user UID before running.';
  end if;

  -- 1. Clean up previous seed rows (idempotent)
  delete from public.order_items
   where order_id in (select id from public.orders where stripe_payment_id like 'seed_test_%');
  delete from public.orders where stripe_payment_id like 'seed_test_%';
  delete from public.products where seller_id = seller_uid and name like 'SEED_TEST_%';

  -- 2. Create 4 test products
  insert into public.products (seller_id, name, label, type_key, price, status, is_active) values
    (seller_uid, 'SEED_TEST_Velvet Lounge Chair',   'Velvet Lounge Chair',    'chair',  189.00, 'active', true),
    (seller_uid, 'SEED_TEST_Brass Arc Floor Lamp',  'Brass Arc Floor Lamp',   'lamp',   124.00, 'active', true),
    (seller_uid, 'SEED_TEST_Hand-knotted Wool Rug', 'Hand-knotted Wool Rug',  'rug',    345.00, 'active', true),
    (seller_uid, 'SEED_TEST_Linen Throw Pillow',    'Linen Throw Pillow Set', 'pillow',  48.00, 'active', true);
  select id into prod1 from public.products where seller_id = seller_uid and name = 'SEED_TEST_Velvet Lounge Chair';
  select id into prod2 from public.products where seller_id = seller_uid and name = 'SEED_TEST_Brass Arc Floor Lamp';
  select id into prod3 from public.products where seller_id = seller_uid and name = 'SEED_TEST_Hand-knotted Wool Rug';
  select id into prod4 from public.products where seller_id = seller_uid and name = 'SEED_TEST_Linen Throw Pillow';

  -- 3. Order 1 — PAID + DELIVERED, with tracking
  insert into public.orders (user_id, stripe_payment_id, status, total_cents, shipping_address, created_at)
  values (seller_uid, 'seed_test_001', 'paid', 18900,
    jsonb_build_object('name','Amelia Hartwell','email','amelia.test@example.com','line1','742 Cypress Ave','line2','Apt 3B','city','Portland','state','OR','postal_code','97214','country','USA'),
    now() - interval '14 days')
  returning id into order1;
  insert into public.order_items (order_id, product_id, seller_id, qty, quantity, unit_price_cents, unit_price, size_label, swatch_name, product_name, fulfillment_status, tracking_number, created_at)
  values (order1, prod1, seller_uid, 1, 1, 18900, 189.00, 'Standard', 'Forest Green', 'Velvet Lounge Chair', 'delivered', '1Z999AA10123456784', now() - interval '14 days');

  -- 4. Order 2 — PAID + SHIPPED, guest checkout
  insert into public.orders (stripe_payment_id, status, total_cents, guest_email, shipping_address, created_at)
  values ('seed_test_002', 'paid', 12400, 'guest.buyer@example.com',
    jsonb_build_object('name','Theo Kim','line1','218 Lakeshore Dr','city','Madison','state','WI','postal_code','53703','country','USA'),
    now() - interval '4 days')
  returning id into order2;
  insert into public.order_items (order_id, product_id, seller_id, qty, quantity, unit_price_cents, unit_price, size_label, swatch_name, product_name, fulfillment_status, tracking_number, created_at)
  values (order2, prod2, seller_uid, 1, 1, 12400, 124.00, null, 'Polished Brass', 'Brass Arc Floor Lamp', 'shipped', '9400111899223456789012', now() - interval '4 days');

  -- 5. Order 3 — PAID + PACKED, multi-item
  insert into public.orders (user_id, stripe_payment_id, status, total_cents, shipping_address, created_at)
  values (seller_uid, 'seed_test_003', 'paid', 39300,
    jsonb_build_object('name','Rosalind Mei','email','rosalind.test@example.com','line1','55 Beacon Hill Rd','city','Brooklyn','state','NY','postal_code','11201','country','USA'),
    now() - interval '1 day')
  returning id into order3;
  insert into public.order_items (order_id, product_id, seller_id, qty, quantity, unit_price_cents, unit_price, size_label, swatch_name, product_name, fulfillment_status, tracking_number, created_at) values
    (order3, prod3, seller_uid, 1, 1, 34500, 345.00, '8x10', 'Charcoal', 'Hand-knotted Wool Rug', 'packed', null, now() - interval '1 day'),
    (order3, prod4, seller_uid, 1, 1, 4800,   48.00, null,   'Oat',      'Linen Throw Pillow Set', 'packed', null, now() - interval '1 day');

  -- 6. Order 4 — PAID + unfulfilled, qty 2
  insert into public.orders (stripe_payment_id, status, total_cents, guest_email, shipping_address, created_at)
  values ('seed_test_004', 'paid', 9600, 'simon.test@example.com',
    jsonb_build_object('name','Simon Vasquez','line1','901 Mission Blvd','city','Austin','state','TX','postal_code','78704','country','USA'),
    now() - interval '3 hours')
  returning id into order4;
  insert into public.order_items (order_id, product_id, seller_id, qty, quantity, unit_price_cents, unit_price, size_label, swatch_name, product_name, fulfillment_status, tracking_number, created_at)
  values (order4, prod4, seller_uid, 2, 2, 4800, 48.00, null, 'Sage', 'Linen Throw Pillow Set', null, null, now() - interval '3 hours');

  -- 7. Order 5 — PENDING
  insert into public.orders (user_id, stripe_payment_id, status, total_cents, shipping_address, created_at)
  values (seller_uid, 'seed_test_005', 'pending', 18900,
    jsonb_build_object('name','Yuki Tanaka','email','yuki.test@example.com','line1','14 Larkspur Ln','city','Seattle','state','WA','postal_code','98101','country','USA'),
    now() - interval '20 minutes')
  returning id into order5;
  insert into public.order_items (order_id, product_id, seller_id, qty, quantity, unit_price_cents, unit_price, size_label, swatch_name, product_name, fulfillment_status, tracking_number, created_at)
  values (order5, prod1, seller_uid, 1, 1, 18900, 189.00, 'Standard', 'Dusty Rose', 'Velvet Lounge Chair', null, null, now() - interval '20 minutes');

  -- 8. Order 6 — CANCELLED
  insert into public.orders (user_id, stripe_payment_id, status, total_cents, shipping_address, created_at)
  values (seller_uid, 'seed_test_006', 'cancelled', 12400,
    jsonb_build_object('name','Marcus Bell','email','marcus.test@example.com','line1','337 Beaufort St','city','Charleston','state','SC','postal_code','29401','country','USA'),
    now() - interval '7 days')
  returning id into order6;
  insert into public.order_items (order_id, product_id, seller_id, qty, quantity, unit_price_cents, unit_price, size_label, swatch_name, product_name, fulfillment_status, tracking_number, created_at)
  values (order6, prod2, seller_uid, 1, 1, 12400, 124.00, null, 'Antique Bronze', 'Brass Arc Floor Lamp', null, null, now() - interval '7 days');

  raise notice 'Seeded 4 products and 6 orders for seller %', seller_uid;
end $$;
