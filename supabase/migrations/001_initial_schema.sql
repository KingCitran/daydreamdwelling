-- ─────────────────────────────────────────────────────────────────
-- DaydreamDwelling — Initial Schema
-- Run this in Supabase Dashboard → SQL Editor
-- ─────────────────────────────────────────────────────────────────

-- Enable UUID extension (already on by default in Supabase)
create extension if not exists "uuid-ossp";

-- ── Profiles ─────────────────────────────────────────────────────
-- Extends auth.users (one row per user, created via trigger)
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  role        text not null default 'customer' check (role in ('customer', 'seller', 'admin')),
  display_name text,
  bio         text,
  avatar_url  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Auto-create a profile when a user signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── Products ──────────────────────────────────────────────────────
create table public.products (
  id           uuid primary key default uuid_generate_v4(),
  seller_id    uuid not null references public.profiles(id) on delete cascade,
  type_key     text not null,          -- matches key in items.js when linked
  name         text not null,
  brand        text,
  description  text,
  category     text,
  subcategory  text,
  status       text not null default 'draft' check (status in ('draft', 'active', 'paused', 'rejected')),
  price        numeric(10,2),
  price_max    numeric(10,2),
  price_per_sqft numeric(10,2),       -- for floor/wall finishes
  is_floor_finish boolean not null default false,
  is_wall_finish  boolean not null default false,
  rating       numeric(3,2) default 0,
  review_count int default 0,
  guarantee    text,
  gradient     text,                   -- CSS gradient for thumbnail
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ── Product Sizes ─────────────────────────────────────────────────
create table public.product_sizes (
  id         uuid primary key default uuid_generate_v4(),
  product_id uuid not null references public.products(id) on delete cascade,
  label      text not null,
  price      numeric(10,2) not null,
  footprint  jsonb,                    -- [w, d] in feet
  height     numeric(6,2),
  sort_order int not null default 0
);

-- ── Product Swatches ──────────────────────────────────────────────
create table public.product_swatches (
  id         uuid primary key default uuid_generate_v4(),
  product_id uuid not null references public.products(id) on delete cascade,
  name       text not null,
  hex        text not null,
  family     text,
  sort_order int not null default 0
);

-- ── Product Images ────────────────────────────────────────────────
create table public.product_images (
  id         uuid primary key default uuid_generate_v4(),
  product_id uuid not null references public.products(id) on delete cascade,
  storage_path text not null,         -- Supabase Storage path
  is_primary  boolean not null default false,
  sort_order  int not null default 0
);

-- ── Product Tags ──────────────────────────────────────────────────
create table public.product_tags (
  id         uuid primary key default uuid_generate_v4(),
  product_id uuid not null references public.products(id) on delete cascade,
  tag_type   text not null check (tag_type in ('style', 'room', 'theme', 'material', 'other')),
  value      text not null
);

-- ── Saved Rooms ───────────────────────────────────────────────────
create table public.saved_rooms (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  name       text not null default 'My Room',
  data       jsonb not null,           -- full room JSON (matches localStorage format)
  thumbnail_url text,
  is_public  boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── Orders ────────────────────────────────────────────────────────
create table public.orders (
  id                uuid primary key default uuid_generate_v4(),
  user_id           uuid references public.profiles(id) on delete set null,
  stripe_payment_id text unique,
  status            text not null default 'pending' check (status in ('pending', 'paid', 'fulfilled', 'refunded', 'cancelled')),
  total_cents       int not null,
  guest_email       text,             -- for guest checkout
  shipping_address  jsonb,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- ── Order Items ───────────────────────────────────────────────────
create table public.order_items (
  id          uuid primary key default uuid_generate_v4(),
  order_id    uuid not null references public.orders(id) on delete cascade,
  product_id  uuid not null references public.products(id),
  seller_id   uuid not null references public.profiles(id),
  size_id     uuid references public.product_sizes(id),
  swatch_id   uuid references public.product_swatches(id),
  qty         int not null default 1,
  unit_price_cents int not null,
  type_key    text,                   -- snapshot of type_key at purchase time
  product_name text                   -- snapshot of name at purchase time
);

-- ── Wishlists ─────────────────────────────────────────────────────
create table public.wishlists (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  size_id    uuid references public.product_sizes(id),
  swatch_id  uuid references public.product_swatches(id),
  created_at timestamptz not null default now(),
  unique (user_id, product_id, size_id, swatch_id)
);

-- ── Reviews ───────────────────────────────────────────────────────
create table public.reviews (
  id          uuid primary key default uuid_generate_v4(),
  product_id  uuid not null references public.products(id) on delete cascade,
  user_id     uuid not null references public.profiles(id) on delete cascade,
  order_id    uuid not null references public.orders(id),  -- verified purchase
  rating      int not null check (rating between 1 and 5),
  body        text,
  seller_reply text,
  created_at  timestamptz not null default now(),
  unique (product_id, user_id, order_id)
);

-- ── Indexes ───────────────────────────────────────────────────────
create index on public.products (seller_id);
create index on public.products (status);
create index on public.product_sizes (product_id);
create index on public.product_swatches (product_id);
create index on public.saved_rooms (user_id);
create index on public.orders (user_id);
create index on public.order_items (order_id);
create index on public.order_items (seller_id);
create index on public.reviews (product_id);
