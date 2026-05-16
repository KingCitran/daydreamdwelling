-- 031_tripo_model.sql
-- Tripo3D-generated 3D model fields on products. Status pipeline:
--   none      — nothing requested yet
--   pending   — queued, photos + dims captured
--   generating — Tripo job running
--   ready     — generation complete, awaiting admin review
--   approved  — visible in customer builder
--   rejected  — admin declined; revisit/regenerate
--   failed    — Tripo error; will retry
-- scale_multiplier + orientation_offset_deg let admins fine-tune the model
-- if Tripo's auto-scale or pose is slightly off.

alter table public.products
  add column if not exists model_3d_storage_path     text,
  add column if not exists model_3d_status           text not null default 'none'
    check (model_3d_status in ('none','pending','generating','ready','approved','rejected','failed')),
  add column if not exists model_3d_tripo_job_id     text,
  add column if not exists model_3d_generated_at     timestamptz,
  add column if not exists model_3d_approved_at      timestamptz,
  add column if not exists scale_multiplier          numeric(5,3) not null default 1.0,
  add column if not exists orientation_offset_deg    int not null default 0;

create index if not exists idx_products_3d_status on public.products(model_3d_status)
  where model_3d_status in ('pending', 'generating', 'ready');
