-- Seller 3D shop layout and Wispy cashier config
create table public.seller_shops (
  seller_id    uuid primary key references auth.users(id) on delete cascade,
  layout       jsonb,
  wispy_greeting text not null default 'Welcome to my shop! ☁',
  updated_at   timestamptz not null default now()
);

alter table public.seller_shops enable row level security;

create policy "sellers_manage_shop" on public.seller_shops
  for all
  using  (auth.uid() = seller_id)
  with check (auth.uid() = seller_id);

create policy "public_read_shops" on public.seller_shops
  for select using (true);
