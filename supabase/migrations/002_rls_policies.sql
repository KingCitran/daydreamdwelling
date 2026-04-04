-- ─────────────────────────────────────────────────────────────────
-- DaydreamDwelling — Row Level Security Policies
-- Run AFTER 001_initial_schema.sql
-- ─────────────────────────────────────────────────────────────────

-- Enable RLS on all tables
alter table public.profiles        enable row level security;
alter table public.products        enable row level security;
alter table public.product_sizes   enable row level security;
alter table public.product_swatches enable row level security;
alter table public.product_images  enable row level security;
alter table public.product_tags    enable row level security;
alter table public.saved_rooms     enable row level security;
alter table public.orders          enable row level security;
alter table public.order_items     enable row level security;
alter table public.wishlists       enable row level security;
alter table public.reviews         enable row level security;

-- ── Profiles ─────────────────────────────────────────────────────
create policy "Profiles are viewable by everyone" on public.profiles
  for select using (true);

create policy "Users can update their own profile" on public.profiles
  for update using (auth.uid() = id);

-- ── Products ─────────────────────────────────────────────────────
create policy "Active products are viewable by everyone" on public.products
  for select using (status = 'active' or auth.uid() = seller_id);

create policy "Sellers can insert their own products" on public.products
  for insert with check (auth.uid() = seller_id);

create policy "Sellers can update their own products" on public.products
  for update using (auth.uid() = seller_id);

create policy "Sellers can delete their draft products" on public.products
  for delete using (auth.uid() = seller_id and status = 'draft');

-- ── Product Sizes / Swatches / Images / Tags ──────────────────────
-- Readable if the parent product is readable
create policy "Product sizes readable if product readable" on public.product_sizes
  for select using (exists (select 1 from public.products p where p.id = product_id and (p.status = 'active' or p.seller_id = auth.uid())));

create policy "Sellers manage their product sizes" on public.product_sizes
  for all using (exists (select 1 from public.products p where p.id = product_id and p.seller_id = auth.uid()));

create policy "Product swatches readable if product readable" on public.product_swatches
  for select using (exists (select 1 from public.products p where p.id = product_id and (p.status = 'active' or p.seller_id = auth.uid())));

create policy "Sellers manage their product swatches" on public.product_swatches
  for all using (exists (select 1 from public.products p where p.id = product_id and p.seller_id = auth.uid()));

create policy "Product images readable if product readable" on public.product_images
  for select using (exists (select 1 from public.products p where p.id = product_id and (p.status = 'active' or p.seller_id = auth.uid())));

create policy "Sellers manage their product images" on public.product_images
  for all using (exists (select 1 from public.products p where p.id = product_id and p.seller_id = auth.uid()));

create policy "Product tags readable if product readable" on public.product_tags
  for select using (exists (select 1 from public.products p where p.id = product_id and (p.status = 'active' or p.seller_id = auth.uid())));

create policy "Sellers manage their product tags" on public.product_tags
  for all using (exists (select 1 from public.products p where p.id = product_id and p.seller_id = auth.uid()));

-- ── Saved Rooms ───────────────────────────────────────────────────
create policy "Users can view their own rooms" on public.saved_rooms
  for select using (auth.uid() = user_id or is_public = true);

create policy "Users can insert their own rooms" on public.saved_rooms
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own rooms" on public.saved_rooms
  for update using (auth.uid() = user_id);

create policy "Users can delete their own rooms" on public.saved_rooms
  for delete using (auth.uid() = user_id);

-- ── Orders ────────────────────────────────────────────────────────
create policy "Users can view their own orders" on public.orders
  for select using (auth.uid() = user_id);

create policy "Authenticated users can create orders" on public.orders
  for insert with check (auth.uid() = user_id);

-- ── Order Items ───────────────────────────────────────────────────
create policy "Users can view their own order items" on public.order_items
  for select using (exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));

create policy "Sellers can view order items for their products" on public.order_items
  for select using (auth.uid() = seller_id);

-- ── Wishlists ─────────────────────────────────────────────────────
create policy "Users manage their own wishlist" on public.wishlists
  for all using (auth.uid() = user_id);

-- ── Reviews ───────────────────────────────────────────────────────
create policy "Reviews are publicly readable" on public.reviews
  for select using (true);

create policy "Verified buyers can create reviews" on public.reviews
  for insert with check (
    auth.uid() = user_id and
    exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid() and o.status = 'paid')
  );

create policy "Users can update their own reviews" on public.reviews
  for update using (auth.uid() = user_id);
