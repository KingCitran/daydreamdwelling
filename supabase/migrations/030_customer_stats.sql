-- 030_customer_stats.sql
-- Lifetime customer stats per (buyer, seller) pair. Powers the repeat-customer
-- badge + LTV display in the seller's OrdersPage. Updated lazily — view, not
-- materialized — so it always reflects current state.

create or replace view public.customer_lifetime_stats
with (security_invoker = on)
as
select
  coalesce(o.user_id, o.guest_email::text::uuid) as buyer_key,  -- groups by user_id if logged in
  oi.seller_id,
  count(distinct o.id) filter (where o.status = 'paid' or o.status = 'fulfilled') as paid_order_count,
  sum(oi.quantity * oi.unit_price) filter (where o.status = 'paid' or o.status = 'fulfilled') as lifetime_revenue,
  max(o.created_at) filter (where o.status = 'paid' or o.status = 'fulfilled') as last_paid_order_at,
  min(o.created_at) filter (where o.status = 'paid' or o.status = 'fulfilled') as first_paid_order_at
from public.order_items oi
join public.orders o on o.id = oi.order_id
group by coalesce(o.user_id, o.guest_email::text::uuid), oi.seller_id;
