-- 054_music_playlists.sql
-- M4 of humming-velvet-tide. Listener-owned playlists of approved tracks.
-- Owners can curate; playlists can be private (owner-only) or public
-- (anyone can read + play). The MusicPlayerContext consumes a playlist
-- the same way it consumes the artist self-listen queue — via
-- setCustomQueue, so no audio engine changes needed.

create table public.music_playlists (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null references auth.users(id) on delete cascade,
  name        text not null,
  description text,
  is_public   boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index music_playlists_owner_idx on public.music_playlists (owner_id, updated_at desc);
create index music_playlists_public_idx on public.music_playlists (is_public, updated_at desc) where is_public;

alter table public.music_playlists enable row level security;

create policy "owner_manages_own_playlists"
  on public.music_playlists for all
  using  (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create policy "public_read_public_playlists"
  on public.music_playlists for select
  using (is_public);

create or replace function public.touch_music_playlist_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists music_playlists_touch_updated_at on public.music_playlists;
create trigger music_playlists_touch_updated_at
  before update on public.music_playlists
  for each row execute function public.touch_music_playlist_updated_at();

-- Tracks-in-playlist join table. sort_order keeps a stable display order;
-- caller fills it (e.g. count of existing tracks at insert time).
create table public.music_playlist_tracks (
  id          bigserial primary key,
  playlist_id uuid not null references public.music_playlists(id) on delete cascade,
  track_id    uuid not null references public.artist_tracks(id) on delete cascade,
  sort_order  integer not null default 0,
  added_at    timestamptz not null default now(),
  unique (playlist_id, track_id)
);

create index music_playlist_tracks_playlist_idx
  on public.music_playlist_tracks (playlist_id, sort_order asc, added_at asc);

alter table public.music_playlist_tracks enable row level security;

-- Reads inherit visibility from the parent playlist (owner sees own, anyone
-- sees public). Writes only by the playlist owner.
create policy "read_tracks_of_visible_playlists"
  on public.music_playlist_tracks for select
  using (
    exists (
      select 1 from public.music_playlists p
      where p.id = music_playlist_tracks.playlist_id
        and (p.owner_id = auth.uid() or p.is_public)
    )
  );

create policy "owner_writes_own_playlist_tracks"
  on public.music_playlist_tracks for all
  using (
    exists (
      select 1 from public.music_playlists p
      where p.id = music_playlist_tracks.playlist_id
        and p.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.music_playlists p
      where p.id = music_playlist_tracks.playlist_id
        and p.owner_id = auth.uid()
    )
  );
