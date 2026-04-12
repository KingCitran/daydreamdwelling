-- Catch-up: create contests tables that were in migration 011 but never applied to the DB

create table if not exists public.contests (
  id          uuid primary key default uuid_generate_v4(),
  title       text not null,
  description text,
  theme       text not null,
  starts_at   timestamptz not null,
  ends_at     timestamptz not null,
  voting_ends_at timestamptz,
  status      text not null default 'upcoming',
  created_at  timestamptz not null default now()
);

create table if not exists public.contest_entries (
  id          uuid primary key default uuid_generate_v4(),
  contest_id  uuid not null references public.contests(id) on delete cascade,
  user_id     uuid not null references public.profiles(id) on delete cascade,
  post_id     uuid not null references public.community_posts(id) on delete cascade,
  vote_count  int not null default 0,
  is_winner   boolean not null default false,
  award       text,
  created_at  timestamptz not null default now(),
  unique (contest_id, user_id)
);

create table if not exists public.contest_votes (
  id          uuid primary key default uuid_generate_v4(),
  entry_id    uuid not null references public.contest_entries(id) on delete cascade,
  user_id     uuid not null references public.profiles(id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique (entry_id, user_id)
);

alter table public.contests enable row level security;
alter table public.contest_entries enable row level security;
alter table public.contest_votes enable row level security;

do $$ begin
  create policy "anyone_read_contests" on public.contests for select using (true);
exception when duplicate_object then null;
end $$;
do $$ begin
  create policy "anyone_read_entries" on public.contest_entries for select using (true);
exception when duplicate_object then null;
end $$;
do $$ begin
  create policy "users_enter_contests" on public.contest_entries for insert with check (auth.uid() = user_id);
exception when duplicate_object then null;
end $$;
do $$ begin
  create policy "anyone_read_votes" on public.contest_votes for select using (true);
exception when duplicate_object then null;
end $$;
do $$ begin
  create policy "users_vote" on public.contest_votes for insert with check (auth.uid() = user_id);
exception when duplicate_object then null;
end $$;

alter table public.profiles add column if not exists ad_free boolean not null default false;
alter table public.profiles add column if not exists ad_free_purchased_at timestamptz;
