-- 042_orders_buyer_shipping.sql
-- Buyer-pays-shipping flow: track which Shippo rate the buyer chose at
-- checkout so the seller's later label purchase uses the same rate, and
-- the cost lines up. Pre-stored at create-checkout time, stamped on the
-- order via the stripe-webhook after payment confirms.

alter table public.orders
  add column if not exists shipping_cost_cents int,
  add column if not exists shipping_carrier    text,
  add column if not exists shipping_service    text,
  add column if not exists shippo_rate_id      text;
