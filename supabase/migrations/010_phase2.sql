-- ── Phase 2 schema additions ───────────────────────────────────────

-- ── Multiple wishlists + gift registry ─────────────────────────────
create table public.wishlist_lists (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  name        text not null default 'My Wishlist',
  is_gift_registry boolean not null default false,
  share_token text unique default encode(gen_random_bytes(8), 'hex'),
  created_at  timestamptz not null default now()
);

create table public.wishlist_items (
  id          uuid primary key default uuid_generate_v4(),
  list_id     uuid not null references public.wishlist_lists(id) on delete cascade,
  type_key    text not null,
  size_index  int not null default 0,
  swatch_index int not null default 0,
  note        text,
  created_at  timestamptz not null default now(),
  unique (list_id, type_key, size_index, swatch_index)
);

alter table public.wishlist_lists enable row level security;
alter table public.wishlist_items enable row level security;

create policy "users_manage_own_lists" on public.wishlist_lists
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "public_read_shared_lists" on public.wishlist_lists
  for select using (share_token is not null);

create policy "users_manage_own_items" on public.wishlist_items
  for all using (list_id in (select id from public.wishlist_lists where user_id = auth.uid()))
  with check (list_id in (select id from public.wishlist_lists where user_id = auth.uid()));

create policy "public_read_shared_items" on public.wishlist_items
  for select using (list_id in (select id from public.wishlist_lists where share_token is not null));

-- ── Discount codes ─────────────────────────────────────────────────
create table public.discount_codes (
  id          uuid primary key default uuid_generate_v4(),
  seller_id   uuid references public.profiles(id) on delete cascade,
  code        text not null,
  type        text not null default 'percent', -- 'percent' or 'fixed'
  value       numeric not null, -- percent (e.g. 15) or cents (e.g. 500)
  min_order_cents int default 0,
  max_uses    int,
  used_count  int not null default 0,
  expires_at  timestamptz,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  unique (seller_id, code)
);

alter table public.discount_codes enable row level security;

create policy "sellers_manage_codes" on public.discount_codes
  for all using (auth.uid() = seller_id) with check (auth.uid() = seller_id);

create policy "anyone_read_active_codes" on public.discount_codes
  for select using (is_active = true);

-- ── Promoted listings ──────────────────────────────────────────────
create table public.promoted_listings (
  id          uuid primary key default uuid_generate_v4(),
  seller_id   uuid not null references public.profiles(id) on delete cascade,
  product_id  uuid not null references public.products(id) on delete cascade,
  placement   text not null default 'search', -- 'search', 'category', 'homepage'
  daily_budget_cents int not null default 500,
  spent_cents int not null default 0,
  starts_at   timestamptz not null default now(),
  ends_at     timestamptz,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

alter table public.promoted_listings enable row level security;

create policy "sellers_manage_promos" on public.promoted_listings
  for all using (auth.uid() = seller_id) with check (auth.uid() = seller_id);

create policy "public_read_active_promos" on public.promoted_listings
  for select using (is_active = true);

-- ── Loyalty / rewards points ───────────────────────────────────────
create table public.loyalty_points (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  amount      int not null, -- positive = earned, negative = redeemed
  reason      text not null, -- 'purchase', 'room_post', 'heart', 'tutorial', 'redeem'
  ref_id      uuid, -- optional: order_id or room_id
  created_at  timestamptz not null default now()
);

alter table public.loyalty_points enable row level security;

create policy "users_read_own_points" on public.loyalty_points
  for select using (auth.uid() = user_id);

create policy "system_insert_points" on public.loyalty_points
  for insert with check (true);

-- Helper: get user's total points
create or replace function public.get_loyalty_balance(uid uuid)
returns bigint language sql security definer set search_path = public
as $$ select coalesce(sum(amount), 0) from public.loyalty_points where user_id = uid; $$;
