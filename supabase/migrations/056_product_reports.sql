-- 056_product_reports.sql
-- Customer-facing product reports. Feeds the admin moderation queue.
-- Reasons: inaccurate 3D model, wrong description, wrong photos,
-- inappropriate content, suspected counterfeit, other.

create table public.product_reports (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references public.products(id) on delete cascade,
  reporter_id uuid references auth.users(id) on delete set null,
  reason      text not null,
  note        text,
  status      text not null default 'pending' check (status in ('pending', 'reviewed', 'dismissed', 'actioned')),
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id),
  created_at  timestamptz not null default now()
);

create index product_reports_product_idx on public.product_reports (product_id, created_at desc);
create index product_reports_status_idx on public.product_reports (status, created_at desc) where status = 'pending';

alter table public.product_reports enable row level security;

-- Anyone can submit a report (even anonymous — reporter_id is nullable)
create policy "anyone_can_report"
  on public.product_reports for insert
  to authenticated, anon
  with check (true);

-- Only admins can read/update reports
create policy "admins_read_reports"
  on public.product_reports for select
  using (public.is_admin());

create policy "admins_update_reports"
  on public.product_reports for update
  using (public.is_admin());
