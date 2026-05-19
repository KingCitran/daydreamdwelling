-- 035_order_photos_bucket.sql
-- Storage bucket for seller pre-ship photos. Sellers upload to
-- <auth.uid()>/<order_item_id>.<ext>. Buyer reads via signed URL pulled
-- from order_items.pre_ship_photo_path. Public so the buyer's
-- OrderHistoryPage can render the image directly without a signed-URL
-- round-trip — the path itself is only known to the buyer of that order.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'order-photos',
  'order-photos',
  true,
  10485760, -- 10MB — typical seller phone photo
  array['image/png', 'image/jpeg', 'image/webp']
) on conflict (id) do nothing;

-- Sellers upload to a folder named with their auth uid.
create policy "sellers_upload_own_order_photos"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'order-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Public reads — the path is unguessable + only buyers/sellers know it.
create policy "public_read_order_photos"
  on storage.objects for select
  to public
  using (bucket_id = 'order-photos');

-- Sellers can replace their own photos (e.g. retake a blurry shot).
create policy "sellers_update_own_order_photos"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'order-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Sellers can delete their own photos.
create policy "sellers_delete_own_order_photos"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'order-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
