-- 025_seller_view_orders.sql
-- Lets sellers SELECT the parent `orders` row for any order that contains one
-- of their products. Without this, sellers can only see order_items for their
-- products but the join to orders comes back null when the buyer was a guest
-- (or any user other than the seller), so payment status / shipping address /
-- guest_email don't render in the seller's OrdersPage.

create policy "Sellers can view orders containing their products" on public.orders
  for select using (
    exists (
      select 1 from public.order_items oi
      where oi.order_id = orders.id and oi.seller_id = auth.uid()
    )
  );
