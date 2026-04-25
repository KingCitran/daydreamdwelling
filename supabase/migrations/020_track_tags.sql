-- Track tagging system — both artists and customers contribute to building a
-- searchable catalog. Artist tags are the official descriptors; community tags
-- are crowdsourced and ranked by repeat additions.

-- ============================================================================
-- 1. Artist's own descriptive tags (free-text, set at submission time)
-- ============================================================================
alter table public.artist_tracks
  add column if not exists descriptive_tags text[] not null default '{}';

create index if not exists artist_tracks_descriptive_tags_idx
  on public.artist_tracks using gin (descriptive_tags);

-- ============================================================================
-- 2. Community-added tags — anyone authenticated can add. Popularity = count.
-- ============================================================================
create table if not exists public.track_community_tags (
  id          bigserial primary key,
  track_id    uuid not null references public.artist_tracks(id) on delete cascade,
  tag         text not null check (length(tag) between 1 and 40),
  added_by    uuid references auth.users(id) on delete set null,
  created_at  timestamptz not null default now(),
  unique (track_id, tag, added_by) -- one tag per user per track
);

create index if not exists track_community_tags_track_idx
  on public.track_community_tags (track_id);
create index if not exists track_community_tags_tag_idx
  on public.track_community_tags (tag);

alter table public.track_community_tags enable row level security;

-- Anyone authenticated can add a tag to an approved track
create policy "auth_users_add_community_tags" on public.track_community_tags
  for insert to authenticated
  with check (
    auth.uid() = added_by
    and exists (
      select 1 from public.artist_tracks t
      where t.id = track_community_tags.track_id and t.approval_status = 'approved'
    )
  );

-- Anyone can read tags
create policy "public_read_community_tags" on public.track_community_tags
  for select using (true);

-- Users can delete tags they added themselves
create policy "users_delete_own_tags" on public.track_community_tags
  for delete to authenticated
  using (auth.uid() = added_by);

-- ============================================================================
-- 3. Aggregated view — convenience query for "tag popularity per track"
-- ============================================================================
create or replace view public.track_tag_summary as
select
  track_id,
  tag,
  count(*)::int     as adders,
  max(created_at)   as last_added
from public.track_community_tags
group by track_id, tag;
