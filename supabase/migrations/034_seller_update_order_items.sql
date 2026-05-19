-- 034_seller_update_order_items.sql
-- Adds an UPDATE policy on order_items so sellers can save tracking numbers,
-- fulfillment status, seller_note, pre_ship_photo_path, etc. on their own
-- order items. Without this, RLS denies the UPDATE silently (PostgREST
-- returns 0 affected rows but no error code), so the seller dashboard's
-- save buttons appear to do nothing.
--
-- USING gates the rows the seller is allowed to update (their own).
-- WITH CHECK prevents reassigning seller_id away from themselves.

create policy "Sellers can update their own order items" on public.order_items
  for update
  using (auth.uid() = seller_id)
  with check (auth.uid() = seller_id);
