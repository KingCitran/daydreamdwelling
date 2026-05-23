-- 041_profiles_insert_policy.sql
-- Profiles had SELECT and UPDATE policies but no INSERT. Supabase upsert()
-- attempts INSERT first (ON CONFLICT DO UPDATE), so the missing INSERT
-- policy was rejecting all profile saves from the settings page once new
-- columns were added that didn't exist when the row was first created
-- (e.g. ship_from_*).

create policy "Users can insert their own profile" on public.profiles
  for insert with check (auth.uid() = id);
