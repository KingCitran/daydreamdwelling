-- 063: Multi-seller payment splitting via Stripe Transfers
--
-- Single-seller carts already work (destination charges). Multi-seller carts
-- currently land all funds in the platform balance with no automatic payout to
-- sellers. This migration adds the columns needed to track per-seller Stripe
-- Transfers so the webhook can split payments and the refund function can
-- reverse them.

-- Which payment model was used for this order:
--   'destination_charge'  → single seller, Stripe handled the split at checkout
--   'separate_transfers'  → multi-seller, webhook created Transfers post-payment
--   NULL                  → legacy orders / demo items / no Connect sellers
alter table public.orders
  add column if not exists payment_model text;

-- The Stripe Transfer ID that moved this seller's share out of the platform
-- balance. NULL for destination-charge orders (Stripe handles those internally)
-- and for demo/non-Connect items.
alter table public.order_items
  add column if not exists stripe_transfer_id text;
