-- ─────────────────────────────────────────────────────────────────
-- DaydreamDwelling — Mood Preference System
-- Run AFTER 002_rls_policies.sql
-- ─────────────────────────────────────────────────────────────────

-- Add mood preference to profiles
alter table public.profiles
  add column if not exists mood_preference text not null default 'Golden Hour';

-- Per-app overrides: e.g. { "outdoor": "Bright Day" }
alter table public.profiles
  add column if not exists app_mood_overrides jsonb not null default '{}';
