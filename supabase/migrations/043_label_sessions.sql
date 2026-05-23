-- 043_label_sessions.sql
-- Per-session grouping of labels generated together. Each browser session
-- (page mount) gets a fresh uuid stamped on every order_item it labels.
-- Powers a 'Past sessions' history view in the seller dashboard so the
-- seller can see/reprint groups of labels from previous work sessions.

alter table public.order_items
  add column if not exists label_session_id uuid;

create index if not exists idx_order_items_label_session on public.order_items (label_session_id)
  where label_session_id is not null;
