-- Landing hero configuration — admin tool manages which rooms
-- appear in the rotating hero on the landing page.

create table public.landing_hero_config (
  id                  uuid primary key default gen_random_uuid(),
  rooms               jsonb not null default '[]'::jsonb,
  brand_room          jsonb,
  brand_interval      int not null default 2,
  revolution_seconds  int not null default 30,
  published_at        timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create table public.landing_room_overrides (
  id                  uuid primary key default gen_random_uuid(),
  source_room_id      uuid references public.saved_rooms(id) on delete set null,
  source_post_id      uuid references public.community_posts(id) on delete set null,
  overrides           jsonb not null default '{}'::jsonb,
  palette_back        jsonb,
  palette_side        jsonb,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- RLS
alter table public.landing_hero_config enable row level security;
alter table public.landing_room_overrides enable row level security;

-- Admin manages everything
create policy "admin_manages_landing_config"
  on public.landing_hero_config for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "admin_manages_landing_overrides"
  on public.landing_room_overrides for all
  using (public.is_admin())
  with check (public.is_admin());

-- Public can read the published config (for the landing page)
create policy "public_reads_published_config"
  on public.landing_hero_config for select to anon, authenticated
  using (published_at is not null);

-- Auto-update updated_at
create or replace function public.touch_landing_config_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger landing_hero_config_touch_updated_at
  before update on public.landing_hero_config
  for each row execute function public.touch_landing_config_updated_at();

create trigger landing_room_overrides_touch_updated_at
  before update on public.landing_room_overrides
  for each row execute function public.touch_landing_config_updated_at();
