-- Multi-click intent analytics for products
-- Tracks three intent levels to filter accidental clicks from real interest:
--   1 = browse (clicked/viewed product tile)
--   2 = interest (opened product details/modal)
--   3 = high_intent (added to cart, wishlist, or room)

create table if not exists product_interactions (
  id          bigint generated always as identity primary key,
  product_id  uuid references products(id) on delete cascade,
  user_id     uuid references auth.users(id) on delete set null,
  session_id  text not null,  -- anonymous tracking for non-signed-in users
  intent_level smallint not null check (intent_level between 1 and 3),
  action      text not null,  -- 'view', 'detail', 'add_to_cart', 'add_to_wishlist', 'place_in_room'
  created_at  timestamptz default now()
);

-- Index for seller analytics queries (per-product aggregation)
create index idx_pi_product_created on product_interactions(product_id, created_at desc);

-- Index for per-user session deduplication
create index idx_pi_session_product on product_interactions(session_id, product_id, intent_level);

-- RLS: anyone can insert (even anonymous), only platform can read all
alter table product_interactions enable row level security;

-- Allow inserts from anyone (analytics events)
create policy "Anyone can log interactions"
  on product_interactions for insert
  with check (true);

-- Sellers can read their own product analytics
create policy "Sellers read own product analytics"
  on product_interactions for select
  using (
    product_id in (
      select id from products where seller_id = auth.uid()
    )
  );

-- Aggregation function for seller dashboard
create or replace function get_product_analytics(p_product_id uuid, p_days int default 30)
returns json
language sql
stable
as $$
  select json_build_object(
    'browse_count', count(*) filter (where intent_level = 1),
    'interest_count', count(*) filter (where intent_level = 2),
    'high_intent_count', count(*) filter (where intent_level = 3),
    'unique_browsers', count(distinct session_id) filter (where intent_level = 1),
    'unique_interested', count(distinct session_id) filter (where intent_level = 2),
    'unique_high_intent', count(distinct session_id) filter (where intent_level = 3),
    'conversion_browse_to_interest', case
      when count(*) filter (where intent_level = 1) > 0
      then round(count(distinct session_id) filter (where intent_level = 2)::numeric /
                 count(distinct session_id) filter (where intent_level = 1)::numeric * 100, 1)
      else 0 end,
    'conversion_interest_to_intent', case
      when count(*) filter (where intent_level = 2) > 0
      then round(count(distinct session_id) filter (where intent_level = 3)::numeric /
                 count(distinct session_id) filter (where intent_level = 2)::numeric * 100, 1)
      else 0 end
  )
  from product_interactions
  where product_id = p_product_id
    and created_at > now() - (p_days || ' days')::interval
$$;
