-- Add missing profile columns that seller SettingsPage already references
alter table public.profiles add column if not exists store_name text;
alter table public.profiles add column if not exists social_instagram text;
alter table public.profiles add column if not exists social_website text;
alter table public.profiles add column if not exists social_tiktok text;
alter table public.profiles add column if not exists social_pinterest text;
