-- Artist Program — schema for free track submission + opt-in monetization
-- (PPC click-throughs, sponsored placements, premium analytics, designer commissions).
-- See plan: C:\Users\danbe\.claude\plans\warm-wiggling-steele.md

-- ============================================================================
-- 1. ARTIST PROFILES
-- ============================================================================
create table public.artist_profiles (
  user_id              uuid primary key references auth.users(id) on delete cascade,
  artist_name          text not null,
  bio                  text,
  avatar_url           text,
  external_links       jsonb not null default '{}'::jsonb,
  preferred_destination text default 'spotify',
  ppc_balance_cents    integer not null default 0,
  ppc_rate_cents       integer not null default 15,
  is_verified          boolean not null default false,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

alter table public.artist_profiles enable row level security;

create policy "artists_manage_own_profile" on public.artist_profiles
  for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "public_read_artist_profiles" on public.artist_profiles
  for select using (true);

-- ============================================================================
-- 2. ARTIST TRACKS
-- ============================================================================
create table public.artist_tracks (
  id                  uuid primary key default gen_random_uuid(),
  artist_id           uuid not null references public.artist_profiles(user_id) on delete cascade,
  title               text not null,
  audio_url           text not null,
  duration_seconds    integer not null,
  genre               text,
  station_tags        text[] not null default '{}',
  mood_tags           text[] not null default '{}',
  approval_status     text not null default 'pending'
                      check (approval_status in ('pending', 'approved', 'rejected', 'flagged')),
  rejection_reason    text,
  flag_reasons        text[] default '{}',
  play_count          integer not null default 0,
  skip_count          integer not null default 0,
  skip_rate           numeric(5,4) default 0,
  rotation_status     text not null default 'active'
                      check (rotation_status in ('active', 'limited', 'removed')),
  audio_fingerprint   text,
  submitted_at        timestamptz not null default now(),
  approved_at         timestamptz
);

create index artist_tracks_artist_idx       on public.artist_tracks (artist_id);
create index artist_tracks_status_idx       on public.artist_tracks (approval_status);
create index artist_tracks_rotation_idx     on public.artist_tracks (rotation_status) where approval_status = 'approved';
create index artist_tracks_station_tags_idx on public.artist_tracks using gin (station_tags);

alter table public.artist_tracks enable row level security;

create policy "artists_manage_own_tracks" on public.artist_tracks
  for all
  using  (auth.uid() = artist_id)
  with check (auth.uid() = artist_id);

create policy "public_read_approved_tracks" on public.artist_tracks
  for select
  using (approval_status = 'approved');

-- ============================================================================
-- 3. PLAY LOG (for skip-rate computation + free analytics)
-- ============================================================================
create table public.artist_track_plays (
  id                       bigserial primary key,
  track_id                 uuid not null references public.artist_tracks(id) on delete cascade,
  user_id                  uuid references auth.users(id) on delete set null,
  station                  text,
  room_mood                text,
  completed                boolean not null default false,
  duration_played_seconds  integer not null default 0,
  played_at                timestamptz not null default now()
);

create index artist_track_plays_track_idx on public.artist_track_plays (track_id, played_at desc);
create index artist_track_plays_user_idx  on public.artist_track_plays (user_id);

alter table public.artist_track_plays enable row level security;

-- Anyone (including anonymous) can log plays — needed for skip-rate calc.
create policy "anyone_log_plays" on public.artist_track_plays
  for insert to public with check (true);

-- Artists can see plays of their own tracks; admins (service role) see all.
create policy "artists_read_own_track_plays" on public.artist_track_plays
  for select
  using (
    exists (
      select 1 from public.artist_tracks t
      where t.id = artist_track_plays.track_id and t.artist_id = auth.uid()
    )
  );

-- ============================================================================
-- 4. PPC CLICKS (billing log)
-- ============================================================================
create table public.artist_ppc_clicks (
  id                bigserial primary key,
  track_id          uuid not null references public.artist_tracks(id) on delete cascade,
  user_id           uuid references auth.users(id) on delete set null,
  destination_url   text not null,
  destination_label text,
  click_cost_cents  integer not null,
  clicked_at        timestamptz not null default now(),
  charged           boolean not null default true
);

create index artist_ppc_clicks_track_idx on public.artist_ppc_clicks (track_id, clicked_at desc);

alter table public.artist_ppc_clicks enable row level security;

-- Inserts only happen via the artist-ppc-click edge function (service role).
-- No public insert policy — clicks must be server-validated.

create policy "artists_read_own_ppc_clicks" on public.artist_ppc_clicks
  for select
  using (
    exists (
      select 1 from public.artist_tracks t
      where t.id = artist_ppc_clicks.track_id and t.artist_id = auth.uid()
    )
  );

-- ============================================================================
-- 5. SPONSORED PLACEMENTS (Phase 2)
-- ============================================================================
create table public.artist_sponsored_placements (
  id                uuid primary key default gen_random_uuid(),
  artist_id         uuid not null references public.artist_profiles(user_id) on delete cascade,
  track_id          uuid not null references public.artist_tracks(id) on delete cascade,
  station           text not null,
  days              integer not null,
  cost_cents        integer not null,
  starts_at         timestamptz,
  ends_at           timestamptz,
  status            text not null default 'pending_payment'
                    check (status in ('pending_payment', 'active', 'completed', 'cancelled')),
  stripe_session_id text,
  created_at        timestamptz not null default now()
);

create index artist_sponsored_active_idx on public.artist_sponsored_placements (station, status, ends_at);

alter table public.artist_sponsored_placements enable row level security;

create policy "artists_manage_own_placements" on public.artist_sponsored_placements
  for all
  using  (auth.uid() = artist_id)
  with check (auth.uid() = artist_id);

create policy "public_read_active_placements" on public.artist_sponsored_placements
  for select
  using (status = 'active' and now() between starts_at and ends_at);

-- ============================================================================
-- 6. PREMIUM ANALYTICS SUBSCRIPTIONS (Phase 2)
-- ============================================================================
create table public.artist_subscriptions (
  id                     uuid primary key default gen_random_uuid(),
  artist_id              uuid not null references public.artist_profiles(user_id) on delete cascade,
  tier                   text not null default 'basic'
                         check (tier in ('basic', 'premium')),
  active                 boolean not null default false,
  starts_at              timestamptz,
  ends_at                timestamptz,
  stripe_subscription_id text,
  created_at             timestamptz not null default now()
);

alter table public.artist_subscriptions enable row level security;

create policy "artists_read_own_subscription" on public.artist_subscriptions
  for select using (auth.uid() = artist_id);

-- ============================================================================
-- 7. DESIGNER COMMISSIONS (Phase 3)
-- ============================================================================
create table public.artist_designer_commissions (
  id                       uuid primary key default gen_random_uuid(),
  artist_id                uuid not null references public.artist_profiles(user_id) on delete cascade,
  designer_id              uuid not null references auth.users(id) on delete cascade,
  track_id                 uuid references public.artist_tracks(id) on delete set null,
  room_post_id             uuid references public.community_posts(id) on delete set null,
  status                   text not null default 'proposed'
                           check (status in ('proposed', 'accepted', 'in_progress', 'completed', 'declined')),
  amount_cents             integer not null,
  platform_fee_cents       integer not null default 0,
  stripe_payment_intent_id text,
  brief                    text,
  created_at               timestamptz not null default now(),
  delivered_at             timestamptz
);

create index artist_commissions_artist_idx   on public.artist_designer_commissions (artist_id, status);
create index artist_commissions_designer_idx on public.artist_designer_commissions (designer_id, status);

alter table public.artist_designer_commissions enable row level security;

create policy "commission_parties_manage" on public.artist_designer_commissions
  for all
  using  (auth.uid() = artist_id or auth.uid() = designer_id)
  with check (auth.uid() = artist_id or auth.uid() = designer_id);

-- ============================================================================
-- STORAGE BUCKET — artist-tracks
-- ============================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'artist-tracks',
  'artist-tracks',
  true,
  15728640, -- 15MB
  array['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav', 'audio/aac', 'audio/mp4', 'audio/x-m4a']
) on conflict (id) do nothing;

create policy "artists_upload_own_tracks"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'artist-tracks'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "public_read_artist_tracks"
  on storage.objects for select
  to public
  using (bucket_id = 'artist-tracks');

create policy "artists_delete_own_tracks"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'artist-tracks'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ============================================================================
-- HELPER: keep updated_at fresh on artist_profiles
-- ============================================================================
create or replace function public.touch_artist_profile_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger artist_profiles_touch_updated_at
  before update on public.artist_profiles
  for each row execute function public.touch_artist_profile_updated_at();

-- ============================================================================
-- TRIGGER: auto-increment cached play_count / skip_count on artist_tracks
-- when a row lands in artist_track_plays. Avoids client-side RPC complexity.
-- skip_rate is recomputed in the same trigger so the dashboard reads stay cheap.
-- ============================================================================
create or replace function public.bump_track_play_counts()
returns trigger language plpgsql as $$
begin
  if new.completed then
    update public.artist_tracks
       set play_count = play_count + 1
     where id = new.track_id;
  else
    update public.artist_tracks
       set skip_count = skip_count + 1
     where id = new.track_id;
  end if;

  -- Recompute skip_rate in-place (cheap — just division on the row we just updated)
  update public.artist_tracks
     set skip_rate = case
                       when (play_count + skip_count) = 0 then 0
                       else skip_count::numeric / (play_count + skip_count)
                     end
   where id = new.track_id;

  return new;
end;
$$;

create trigger artist_track_plays_bump_counts
  after insert on public.artist_track_plays
  for each row execute function public.bump_track_play_counts();
