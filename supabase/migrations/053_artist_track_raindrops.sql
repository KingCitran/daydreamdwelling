-- 053_artist_track_raindrops.sql
-- M5 of humming-velvet-tide. Raindrops are listener upvotes on a track —
-- the engagement primitive for the music feature. Caps enforced via RPC:
--   1 raindrop per (user, track) per day
--   5 raindrops per user per day total
-- The denormalized counter on artist_tracks (raindrop_count) keeps
-- public leaderboard queries cheap. Rotation-boost weighting (1.05× per
-- raindrop with 14-day decay) is consumed at queue-build time elsewhere
-- and not stored here; the dropped_at timestamp is the source of truth.

create table public.artist_track_raindrops (
  id          bigserial primary key,
  track_id    uuid not null references public.artist_tracks(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  dropped_at  timestamptz not null default now()
);

-- One raindrop per (user, track) per UTC day. AT TIME ZONE 'UTC' cast is
-- immutable so Postgres accepts it in an index expression; the more
-- obvious date_trunc('day', dropped_at) isn't immutable (depends on the
-- session timezone) and fails with 42P17.
create unique index artist_track_raindrops_daily_unique
  on public.artist_track_raindrops (track_id, user_id, ((dropped_at AT TIME ZONE 'UTC')::date));

create index artist_track_raindrops_track_idx
  on public.artist_track_raindrops (track_id, dropped_at desc);
create index artist_track_raindrops_user_idx
  on public.artist_track_raindrops (user_id, dropped_at desc);

alter table public.artist_track_raindrops enable row level security;

-- Reads are public — listeners see who's been raindropping what (leaderboard).
create policy "public_read_raindrops"
  on public.artist_track_raindrops for select
  using (true);

-- No public INSERT — only the SECURITY DEFINER give_raindrop RPC writes here.

-- Denormalized counter on artist_tracks for cheap "show me the raindrop count"
-- reads (catalog cards, leaderboards). Trigger keeps it in sync.
alter table public.artist_tracks
  add column if not exists raindrop_count integer not null default 0;

create or replace function public.bump_raindrop_count()
returns trigger language plpgsql as $$
begin
  if tg_op = 'INSERT' then
    update public.artist_tracks
      set raindrop_count = raindrop_count + 1
      where id = new.track_id;
  elsif tg_op = 'DELETE' then
    update public.artist_tracks
      set raindrop_count = greatest(raindrop_count - 1, 0)
      where id = old.track_id;
  end if;
  return null;
end;
$$;

drop trigger if exists artist_track_raindrops_bump_count on public.artist_track_raindrops;
create trigger artist_track_raindrops_bump_count
  after insert or delete on public.artist_track_raindrops
  for each row execute function public.bump_raindrop_count();

-- give_raindrop: the only legal way to insert. Enforces both caps server-side
-- so a hostile client can't bypass them by hitting the table directly.
create or replace function public.give_raindrop(p_track_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id          uuid;
  v_existing_today   int;
  v_daily_total      int;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'Sign in to give a raindrop';
  end if;

  -- Track must exist and be approved + active (no raindrops on rejected /
  -- removed tracks).
  if not exists (
    select 1 from public.artist_tracks
    where id = p_track_id
      and approval_status = 'approved'
      and rotation_status <> 'removed'
  ) then
    raise exception 'Track not available for raindrops';
  end if;

  -- Cap 1: one raindrop per (user, track) per UTC day.
  select count(*) into v_existing_today
  from public.artist_track_raindrops
  where user_id = v_user_id
    and track_id = p_track_id
    and dropped_at >= date_trunc('day', now() AT TIME ZONE 'UTC') AT TIME ZONE 'UTC'
    and dropped_at <  (date_trunc('day', now() AT TIME ZONE 'UTC') + interval '1 day') AT TIME ZONE 'UTC';
  if v_existing_today > 0 then
    raise exception 'You already gave this track a raindrop today';
  end if;

  -- Cap 2: five raindrops per user per UTC day total.
  select count(*) into v_daily_total
  from public.artist_track_raindrops
  where user_id = v_user_id
    and dropped_at >= date_trunc('day', now() AT TIME ZONE 'UTC') AT TIME ZONE 'UTC'
    and dropped_at <  (date_trunc('day', now() AT TIME ZONE 'UTC') + interval '1 day') AT TIME ZONE 'UTC';
  if v_daily_total >= 5 then
    raise exception 'Daily raindrop limit reached — 5 per day';
  end if;

  insert into public.artist_track_raindrops (track_id, user_id)
  values (p_track_id, v_user_id);
end;
$$;

revoke all on function public.give_raindrop(uuid) from public;
grant execute on function public.give_raindrop(uuid) to authenticated;
