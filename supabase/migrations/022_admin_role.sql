-- Admin role + lock down moderation columns on artist_tracks.
--
-- Closes a privilege-escalation gap: previously, the catch-all RLS policy
-- "artists_manage_own_tracks" (for all) let an artist UPDATE any column on
-- their own tracks — including approval_status — bypassing the admin queue.
--
-- After this migration:
--   - Artists may SELECT/INSERT/DELETE their own tracks, and UPDATE only the
--     non-moderation columns (title, audio_url, genre, tags, etc.).
--   - Only admins (rows in public.admin_users) may UPDATE moderation columns
--     (approval_status, rejection_reason, flag_reasons, rotation_status,
--     audio_fingerprint, approved_at) and system-managed counters.
--   - kingcitran@gmail.com is bootstrapped as the initial admin.

-- ============================================================================
-- 1. ADMIN_USERS table
-- ============================================================================
create table public.admin_users (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  granted_by uuid references auth.users(id),
  granted_at timestamptz not null default now(),
  notes      text
);

alter table public.admin_users enable row level security;

-- ============================================================================
-- 2. is_admin() — SECURITY DEFINER so policies can call it without granting
--    RLS-level read on admin_users (avoids recursive policy evaluation).
-- ============================================================================
create or replace function public.is_admin(uid uuid default auth.uid())
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (select 1 from public.admin_users where user_id = uid)
$$;

grant execute on function public.is_admin(uuid) to authenticated, anon;

-- Now that the function exists, gate admin_users reads through it.
create policy "admins_read_admin_users" on public.admin_users
  for select using (public.is_admin());

-- ============================================================================
-- 3. Replace the over-broad artists_manage_own_tracks policy
-- ============================================================================
drop policy if exists "artists_manage_own_tracks" on public.artist_tracks;

create policy "artists_select_own_tracks" on public.artist_tracks
  for select
  using (auth.uid() = artist_id);

-- New tracks must start as pending + active rotation. No client-side approval.
create policy "artists_insert_own_tracks" on public.artist_tracks
  for insert
  with check (
    auth.uid() = artist_id
    and approval_status = 'pending'
    and rotation_status = 'active'
  );

create policy "artists_delete_own_tracks" on public.artist_tracks
  for delete
  using (auth.uid() = artist_id);

-- Row-level: artist may UPDATE their own row. Column-level restriction is
-- enforced by the trigger below (Postgres RLS has no column-level support).
create policy "artists_update_own_tracks" on public.artist_tracks
  for update
  using  (auth.uid() = artist_id)
  with check (auth.uid() = artist_id);

-- Admins may UPDATE any track (approval workflow).
create policy "admins_update_any_track" on public.artist_tracks
  for update
  using  (public.is_admin())
  with check (public.is_admin());

-- ============================================================================
-- 4. TRIGGER — block non-admins from changing moderation/system columns.
-- ============================================================================
create or replace function public.guard_artist_track_columns()
returns trigger language plpgsql as $$
begin
  if public.is_admin() then
    return new;
  end if;

  if new.approval_status   is distinct from old.approval_status
  or new.rejection_reason  is distinct from old.rejection_reason
  or new.flag_reasons      is distinct from old.flag_reasons
  or new.rotation_status   is distinct from old.rotation_status
  or new.audio_fingerprint is distinct from old.audio_fingerprint
  or new.approved_at       is distinct from old.approved_at
  or new.play_count        is distinct from old.play_count
  or new.skip_count        is distinct from old.skip_count
  or new.skip_rate         is distinct from old.skip_rate
  or new.artist_id         is distinct from old.artist_id
  then
    raise exception 'Only admins can modify moderation or system columns on artist_tracks';
  end if;

  return new;
end;
$$;

create trigger artist_tracks_guard_columns
  before update on public.artist_tracks
  for each row execute function public.guard_artist_track_columns();

-- ============================================================================
-- 5. BOOTSTRAP: grant kingcitran@gmail.com admin (idempotent)
-- ============================================================================
do $$
declare
  v_user_id uuid;
begin
  select id into v_user_id from auth.users where email = 'kingcitran@gmail.com';
  if v_user_id is not null then
    insert into public.admin_users (user_id, notes)
      values (v_user_id, 'Initial admin (project owner)')
      on conflict (user_id) do nothing;
  end if;
end $$;
