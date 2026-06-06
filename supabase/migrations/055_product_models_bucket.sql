-- 055_product_models_bucket.sql
-- Storage bucket for Tripo3D-generated .glb models.
-- Layout: {product_id}/{tripo_task_id}.glb
-- Public read so the customer room builder can load models without signed URLs.
-- Only service-role (edge functions) writes here — no direct seller upload.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-models',
  'product-models',
  true,
  52428800, -- 50MB per file (3D models can be large)
  array['model/gltf-binary', 'application/octet-stream']
) on conflict (id) do nothing;

-- Public read for the customer builder
create policy "public_read_product_models"
  on storage.objects for select
  to public
  using (bucket_id = 'product-models');

-- Only service role writes (edge functions use adminClient) — no user-facing
-- insert/update/delete policies needed.
