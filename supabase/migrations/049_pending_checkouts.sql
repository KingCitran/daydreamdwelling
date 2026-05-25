-- 049_pending_checkouts.sql
-- Stripe Checkout metadata fields are capped at 500 chars each — a 3-item
-- cart of canonical line items (productId, sellerId, sizeId, swatchId,
-- productName, sizeLabel, swatchName, unitPriceCents, qty, typeKey) easily
-- overflows. Until now create-checkout was JSON.stringifying the validated
-- items into a single metadata field and praying. This table moves the
-- full canonical payload server-side, keyed by Stripe session id.
--
-- Flow:
--   1. create-checkout creates a Stripe Checkout Session, then INSERTs a
--      row here with stripe_session_id + the full validated items + buyer
--      context (mood, room, address, shipping rate).
--   2. stripe-webhook on checkout.session.completed selects from this
--      table by session.id and uses that data to build orders +
--      order_items. Stamps consumed_at after a successful order insert.
--   3. Old in-flight sessions whose metadata still has the inline items
--      JSON keep working — webhook falls back to metadata.items if no
--      pending_checkouts row exists.
--
-- RLS enabled, no policies declared. Only the service-role client (inside
-- the edge functions) reads or writes this table.

create table public.pending_checkouts (
  id                    uuid primary key default uuid_generate_v4(),
  stripe_session_id     text unique not null,
  items                 jsonb not null,
  buyer_user_id         uuid references auth.users(id) on delete set null,
  buyer_email           text,
  buyer_mood            text,
  buyer_room_name       text,
  buyer_address         jsonb,
  shippo_rate_id        text,
  shipping_cost_cents   int,
  shipping_carrier      text,
  shipping_service      text,
  created_at            timestamptz not null default now(),
  consumed_at           timestamptz
);

create index idx_pending_checkouts_session on public.pending_checkouts (stripe_session_id);
create index idx_pending_checkouts_unconsumed
  on public.pending_checkouts (created_at desc) where consumed_at is null;

alter table public.pending_checkouts enable row level security;
-- No policies. Service role bypasses RLS; everyone else gets nothing.
