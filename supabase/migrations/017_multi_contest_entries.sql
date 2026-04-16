-- Allow multiple contest entries per user (designers can submit several rooms)
alter table public.contest_entries
  drop constraint if exists contest_entries_contest_id_user_id_key;
