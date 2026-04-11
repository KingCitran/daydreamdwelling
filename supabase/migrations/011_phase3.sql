-- ── Phase 3 schema ─────────────────────────────────────────────────

-- ── Designer community feed ────────────────────────────────────────
create table public.community_posts (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  room_id       uuid references public.saved_rooms(id) on delete set null,
  title         text not null,
  description   text,
  screenshot_url text,
  music_station text,
  heart_count   int not null default 0,
  placement_count int not null default 0,
  is_featured   boolean not null default false,
  created_at    timestamptz not null default now()
);

create table public.community_hearts (
  id        uuid primary key default uuid_generate_v4(),
  user_id   uuid not null references public.profiles(id) on delete cascade,
  post_id   uuid not null references public.community_posts(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, post_id)
);

alter table public.community_posts enable row level security;
alter table public.community_hearts enable row level security;

create policy "anyone_read_posts" on public.community_posts for select using (true);
create policy "users_create_posts" on public.community_posts for insert with check (auth.uid() = user_id);
create policy "users_update_own_posts" on public.community_posts for update using (auth.uid() = user_id);
create policy "users_delete_own_posts" on public.community_posts for delete using (auth.uid() = user_id);

create policy "anyone_read_hearts" on public.community_hearts for select using (true);
create policy "users_toggle_hearts" on public.community_hearts for insert with check (auth.uid() = user_id);
create policy "users_remove_hearts" on public.community_hearts for delete using (auth.uid() = user_id);

-- ── Designer tiers ─────────────────────────────────────────────────
-- Tiers computed from community_posts stats, stored on profile for quick access
alter table public.profiles add column if not exists designer_tier int not null default 0;
alter table public.profiles add column if not exists designer_title text;
-- 0=none, 1=Reverie, 2=Drift, 3=Wander, 4=Lucid, 5=Ethereal

-- ── Pets system ────────────────────────────────────────────────────
create table public.pet_types (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null unique,
  description text,
  sprite_url  text,
  rarity      text not null default 'common', -- common, uncommon, rare, legendary
  unlock_method text not null default 'tier', -- 'tier', 'purchase', 'event', 'reward'
  unlock_value text, -- e.g. tier number, event name
  created_at  timestamptz not null default now()
);

create table public.user_pets (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  pet_type_id uuid not null references public.pet_types(id) on delete cascade,
  nickname    text,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  unique (user_id, pet_type_id)
);

alter table public.pet_types enable row level security;
alter table public.user_pets enable row level security;

create policy "anyone_read_pet_types" on public.pet_types for select using (true);
create policy "users_manage_own_pets" on public.user_pets for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Seed some starter pet types
insert into public.pet_types (name, description, rarity, unlock_method, unlock_value) values
  ('Cloudlet',   'A tiny puff of cloud that follows you around',        'common',    'tier', '1'),
  ('Moonbeam',   'A gentle glow that dances near your furniture',       'uncommon',  'tier', '2'),
  ('Starwhisk',  'A twinkling star cat with cosmic whiskers',           'rare',      'tier', '3'),
  ('Dreamfox',   'An ethereal fox made of soft aurora light',           'rare',      'tier', '4'),
  ('Nebulion',   'A majestic cloud dragon from the dream dimension',    'legendary', 'tier', '5');

-- ── Theme contests ─────────────────────────────────────────────────
create table public.contests (
  id          uuid primary key default uuid_generate_v4(),
  title       text not null,
  description text,
  theme       text not null,
  starts_at   timestamptz not null,
  ends_at     timestamptz not null,
  voting_ends_at timestamptz,
  status      text not null default 'upcoming', -- upcoming, active, voting, judging, complete
  created_at  timestamptz not null default now()
);

create table public.contest_entries (
  id          uuid primary key default uuid_generate_v4(),
  contest_id  uuid not null references public.contests(id) on delete cascade,
  user_id     uuid not null references public.profiles(id) on delete cascade,
  post_id     uuid not null references public.community_posts(id) on delete cascade,
  vote_count  int not null default 0,
  is_winner   boolean not null default false,
  award       text, -- 'popular_vote', 'team_pick', 'most_creative', 'overall'
  created_at  timestamptz not null default now(),
  unique (contest_id, user_id)
);

create table public.contest_votes (
  id          uuid primary key default uuid_generate_v4(),
  entry_id    uuid not null references public.contest_entries(id) on delete cascade,
  user_id     uuid not null references public.profiles(id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique (entry_id, user_id)
);

alter table public.contests enable row level security;
alter table public.contest_entries enable row level security;
alter table public.contest_votes enable row level security;

create policy "anyone_read_contests" on public.contests for select using (true);
create policy "anyone_read_entries" on public.contest_entries for select using (true);
create policy "users_enter_contests" on public.contest_entries for insert with check (auth.uid() = user_id);
create policy "anyone_read_votes" on public.contest_votes for select using (true);
create policy "users_vote" on public.contest_votes for insert with check (auth.uid() = user_id);

-- ── Lifetime ad removal ────────────────────────────────────────────
alter table public.profiles add column if not exists ad_free boolean not null default false;
alter table public.profiles add column if not exists ad_free_purchased_at timestamptz;
