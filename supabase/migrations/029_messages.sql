-- 029_messages.sql
-- Order-scoped messages between buyer and seller. Each message ties to an
-- order_id; either party can send. Unread state tracked per recipient via
-- read_at (null = unread). Both apps query the same table; UI threads by
-- order_id.

create table if not exists public.messages (
  id           uuid primary key default uuid_generate_v4(),
  order_id     uuid not null references public.orders(id) on delete cascade,
  from_user_id uuid not null references public.profiles(id),
  to_user_id   uuid not null references public.profiles(id),
  body         text not null,
  created_at   timestamptz not null default now(),
  read_at      timestamptz
);

create index if not exists idx_messages_order on public.messages(order_id);
create index if not exists idx_messages_to_unread on public.messages(to_user_id, read_at);

alter table public.messages enable row level security;

-- Sender and recipient can read.
create policy "Participants can read their messages" on public.messages
  for select using (auth.uid() = from_user_id or auth.uid() = to_user_id);

-- Only the sender can insert their own message.
create policy "Senders can insert their messages" on public.messages
  for insert with check (auth.uid() = from_user_id);

-- Recipient can flip read_at to mark a message read; nothing else.
create policy "Recipients can mark messages read" on public.messages
  for update using (auth.uid() = to_user_id);
