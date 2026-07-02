-- 060: Safety guardrails — idempotency, soft-delete, cascade fixes
-- From the site-wide data-safety audit

-- ── H1: Prevent duplicate orders from webhook retries ──────────────
-- Unique constraint on stripe_payment_id so a second insert fails
-- instead of creating a duplicate order.
CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_stripe_payment_unique
  ON public.orders (stripe_payment_id)
  WHERE stripe_payment_id IS NOT NULL;

-- ── H4: Soft-delete for products ──────────────────────────────────
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

-- Soft-deleted products are invisible to normal queries
CREATE INDEX IF NOT EXISTS idx_products_active_not_deleted
  ON public.products (seller_id, created_at DESC)
  WHERE is_active = true AND deleted_at IS NULL;

-- ── H4: Soft-delete for orders (admin safety net) ─────────────────
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

-- ── M4: Messages — don't cascade-delete on order removal ──────────
-- Change from ON DELETE CASCADE to ON DELETE SET NULL so deleting
-- an order preserves the conversation history.
ALTER TABLE public.messages
  DROP CONSTRAINT IF EXISTS messages_order_id_fkey;

ALTER TABLE public.messages
  ADD CONSTRAINT messages_order_id_fkey
    FOREIGN KEY (order_id) REFERENCES public.orders(id)
    ON DELETE SET NULL;

-- ── M1: Prevent duplicate shipping labels ─────────────────────────
-- A unique constraint on shippo_transaction_id prevents two concurrent
-- label purchases for the same rate from both succeeding in the DB.
CREATE UNIQUE INDEX IF NOT EXISTS idx_order_items_shippo_tx_unique
  ON public.order_items (shippo_transaction_id)
  WHERE shippo_transaction_id IS NOT NULL;
