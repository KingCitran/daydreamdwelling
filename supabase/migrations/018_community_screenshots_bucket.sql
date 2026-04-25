-- Create the community-screenshots storage bucket
-- This was missing, causing all screenshot uploads to fail silently
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'community-screenshots',
  'community-screenshots',
  true,
  5242880, -- 5MB
  array['image/png', 'image/jpeg', 'image/webp']
) on conflict (id) do nothing;

-- Allow authenticated users to upload their own screenshots
create policy "users_upload_own_screenshots"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'community-screenshots'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow public reads for community screenshots
create policy "public_read_screenshots"
  on storage.objects for select
  to public
  using (bucket_id = 'community-screenshots');

-- Allow users to delete their own screenshots
create policy "users_delete_own_screenshots"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'community-screenshots'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
