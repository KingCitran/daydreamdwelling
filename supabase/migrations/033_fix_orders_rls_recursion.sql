-- 033_fix_orders_rls_recursion.sql
-- Migration 025 added a policy on `orders` whose USING clause subselects
-- `order_items` to check seller ownership. Postgres's RLS evaluator follows
-- RLS into that subselect; the order_items policies in 002 subselect back
-- into orders to check buyer ownership, and the cycle trips the engine:
--   ERROR: 42P17: infinite recursion detected in policy for relation "orders"
--
-- Fix: wrap the seller-check subselect in a SECURITY DEFINER function. The
-- function runs as the function owner (postgres), which bypasses RLS on its
-- internal queries and breaks the cycle. The policy itself still gates on
-- auth.uid() so unauthenticated requests get nothing.

drop policy if exists "Sellers can view orders containing their products" on public.orders;

create or replace function public.order_has_seller(order_uuid uuid, seller_uuid uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.order_items
    where order_id = order_uuid and seller_id = seller_uuid
  );
$$;

revoke all on function public.order_has_seller(uuid, uuid) from public;
grant execute on function public.order_has_seller(uuid, uuid) to authenticated;

create policy "Sellers can view orders containing their products" on public.orders
  for select using (public.order_has_seller(orders.id, auth.uid()));
