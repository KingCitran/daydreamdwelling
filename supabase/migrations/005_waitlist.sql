-- ─────────────────────────────────────────────────────────────────
-- DaydreamDwelling — Waitlist Table
-- Run in Supabase Dashboard → SQL Editor
-- ─────────────────────────────────────────────────────────────────

create table public.waitlist (
  id         uuid primary key default uuid_generate_v4(),
  email      text not null,
  created_at timestamptz not null default now(),
  constraint waitlist_email_unique unique (email)
);

-- Anyone (including anonymous visitors) can sign up
create policy "Anyone can join waitlist"
  on public.waitlist for insert
  with check (true);

-- Only service role can read (admin use only)
alter table public.waitlist enable row level security;

create index on public.waitlist (email);
