-- 023_security_invoker.sql
-- Fixes the Supabase advisor warning "Security Definer View" for
-- public.track_tag_summary.
--
-- Background: by default, Postgres views run RLS using the view OWNER's
-- permissions rather than the calling user's — effectively SECURITY DEFINER.
-- That can leak data if the underlying tables have restrictive RLS that the
-- view bypasses. Supabase's advisor flags every view that doesn't explicitly
-- opt into security_invoker.
--
-- track_tag_summary is an aggregate over public.track_community_tags, which
-- already has a permissive SELECT policy ("public_read_community_tags" using
-- (true)). Switching to security_invoker is safe — the underlying data is
-- already publicly readable — and removes the warning.

alter view public.track_tag_summary set (security_invoker = on);
