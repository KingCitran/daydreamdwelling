-- Safe public function: returns waitlist count without exposing emails
create or replace function public.get_waitlist_count()
returns bigint
language sql
security definer
set search_path = public
as $$
  select count(*) from public.waitlist;
$$;
