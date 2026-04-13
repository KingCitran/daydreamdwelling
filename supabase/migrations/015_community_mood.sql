-- Add mood column to community_posts for room mood context
alter table public.community_posts add column if not exists mood text;
