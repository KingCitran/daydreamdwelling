-- 052_artist_images.sql
-- Adds cover_url to artist_profiles and creates the artist-images
-- storage bucket for both avatars and cover images. Without these,
-- artist profiles look like placeholder rows — critical for marketing
-- outreach where we'll be pointing musicians to their public-facing
-- pages.
--
-- Bucket layout: {user_id}/avatar-{timestamp}.{ext}
--                {user_id}/cover-{timestamp}.{ext}
--
-- RLS: artists insert/delete in their own folder; public read so the
-- landing + dashboard + community feeds can show the images without
-- signed URLs.

alter table public.artist_profiles
  add column if not exists cover_url text;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'artist-images',
  'artist-images',
  true,
  5242880, -- 5MB per file
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) on conflict (id) do nothing;

create policy "artists_upload_own_images"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'artist-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "artists_update_own_images"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'artist-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "artists_delete_own_images"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'artist-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "public_read_artist_images"
  on storage.objects for select
  to public
  using (bucket_id = 'artist-images');
