-- 050_order_photos_private.sql
-- Flip order-photos bucket from public to private and replace the
-- everyone-can-read policy with scoped read policies. Combined with
-- supabase-js createSignedUrl() on the client, this means a leaked
-- photo URL can no longer be fetched without auth.
--
-- Read access:
--   - Sellers can read anything in their own folder (path begins with
--     their auth.uid()).
--   - Buyers can read paths that appear as pre_ship_photo_path on an
--     order_item belonging to one of their orders (matched by user_id
--     OR by guest_email = JWT email, same pattern as migration 047).
--
-- Insert/update/delete policies stay unchanged from migration 035 —
-- sellers manage their own folder.

update storage.buckets set public = false where id = 'order-photos';

drop policy if exists "public_read_order_photos" on storage.objects;

create policy "sellers_read_own_order_photos"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'order-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "buyers_read_their_order_photos"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'order-photos'
    and exists (
      select 1
      from public.order_items oi
      join public.orders o on o.id = oi.order_id
      where oi.pre_ship_photo_path = storage.objects.name
        and (
          o.user_id = auth.uid()
          or (o.user_id is null and o.guest_email = (auth.jwt() ->> 'email'))
        )
    )
  );
