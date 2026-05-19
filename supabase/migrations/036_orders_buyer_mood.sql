-- 036_orders_buyer_mood.sql
-- Captures the buyer's current room mood (and room name) at the moment of
-- checkout. Sellers see this as a "Ordered for their {mood} room" context
-- in their OrdersPage so they can tailor the unboxing experience.
--
-- Both nullable: guests, marketplace-only browsers, and pre-mood-rollout
-- orders simply have no badge.

alter table public.orders
  add column if not exists buyer_mood       text,
  add column if not exists buyer_room_name  text;
