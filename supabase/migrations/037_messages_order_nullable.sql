-- 037_messages_order_nullable.sql
-- Allow messages without an order — buyers should be able to ask sellers
-- questions before purchasing (e.g. from a product page or seller profile).
-- Threading falls back to the (from_user, to_user) pair when order_id is null.

alter table public.messages
  alter column order_id drop not null;
