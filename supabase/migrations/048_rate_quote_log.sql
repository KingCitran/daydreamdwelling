-- 048_rate_quote_log.sql
-- Per-caller rate limit for get-shipping-rates. Each Shippo rate quote
-- costs us a little in live mode and lets an attacker bulk-probe seller
-- ship-from zips by diffing rates. Authed users are gated by user_id;
-- anonymous callers fall back to a hashed IP (raw IP isn't stored).
--
-- The function inserts one row per quote, then before returning a quote
-- counts rows in the last hour for the same identifier and refuses if >=
-- the cap (currently 30/hr in the function).
--
-- No RLS read policy is added — only the service-role client (inside the
-- edge function) needs to read this table.

create table public.rate_quote_log (
  id          bigserial primary key,
  user_id     uuid references auth.users(id) on delete set null,
  ip_hash     text,
  created_at  timestamptz not null default now()
);

create index idx_rate_quote_log_user_created
  on public.rate_quote_log (user_id, created_at desc)
  where user_id is not null;

create index idx_rate_quote_log_ip_created
  on public.rate_quote_log (ip_hash, created_at desc)
  where ip_hash is not null;

alter table public.rate_quote_log enable row level security;
-- No policies declared. Service-role bypasses RLS; everyone else gets
-- nothing. This is intentional — only the function should touch it.
