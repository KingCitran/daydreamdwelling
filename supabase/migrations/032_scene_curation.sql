-- 032_scene_curation.sql
-- Shared dev-curation storage for scene assets (drape anchors, vine/floral
-- exclusion lists, flat-bottom cloud picks, future per-mood shape arrays).
--
-- Edits made in /asset-picker.html and /clouds-picker.html previously lived
-- only in the editor's localStorage, so curation work didn't propagate to
-- other browsers/devices and required a paste-into-Claude-bake-and-commit
-- loop. With this table the picker writes directly to Supabase, the customer
-- app pulls the latest at boot, and curation is shared across the team.
--
-- Schema is intentionally a key/value bag — we don't need to model each
-- curation surface separately, and adding new keys later is just an upsert
-- (no migration needed).
--
-- RLS: public read so visitors get the curated pool; admin-only write so a
-- random anon user can't poison the production scene.

create table public.scene_curation (
  key        text primary key,
  value      jsonb       not null,
  updated_at timestamptz not null default now(),
  updated_by uuid        references auth.users(id)
);

alter table public.scene_curation enable row level security;

-- Anyone (anon + auth) can read curation rows so the customer app can hydrate
-- before the user signs in.
create policy "scene_curation_read" on public.scene_curation
  for select using (true);

-- Only admins (rows in public.admin_users, see 022_admin_role.sql) can write.
create policy "scene_curation_admin_write" on public.scene_curation
  for all
  using      (public.is_admin())
  with check (public.is_admin());

-- Auto-stamp updated_at + updated_by on every write.
create or replace function public.scene_curation_touch()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  new.updated_by := auth.uid();
  return new;
end;
$$;

create trigger scene_curation_touch_trigger
  before insert or update on public.scene_curation
  for each row execute function public.scene_curation_touch();
