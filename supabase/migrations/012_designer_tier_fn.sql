-- Recalculate designer tier for a user based on their community stats
-- Tier thresholds from spec:
--   1 Reverie:  first room posted
--   2 Drift:    50 hearts OR 10 placements
--   3 Wander:   200 hearts AND 50 placements
--   4 Lucid:    500 hearts AND 200 placements
--   5 Ethereal: 1000 hearts AND 500 placements
create or replace function public.recalc_designer_tier(uid uuid)
returns void language plpgsql security definer set search_path = public
as $$
declare
  total_hearts int;
  total_placements int;
  post_count int;
  new_tier int := 0;
  tier_names text[] := array['', 'Reverie', 'Drift', 'Wander', 'Lucid', 'Ethereal'];
begin
  select count(*) into post_count from community_posts where user_id = uid;
  select coalesce(sum(heart_count), 0) into total_hearts from community_posts where user_id = uid;
  select coalesce(sum(placement_count), 0) into total_placements from community_posts where user_id = uid;

  if total_hearts >= 1000 and total_placements >= 500 then new_tier := 5;
  elsif total_hearts >= 500 and total_placements >= 200 then new_tier := 4;
  elsif total_hearts >= 200 and total_placements >= 50 then new_tier := 3;
  elsif total_hearts >= 50 or total_placements >= 10 then new_tier := 2;
  elsif post_count >= 1 then new_tier := 1;
  end if;

  update profiles set designer_tier = new_tier, designer_title = tier_names[new_tier + 1] where id = uid;
end;
$$;
