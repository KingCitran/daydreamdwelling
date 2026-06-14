-- 059: Order activity log + estimated delivery days
-- Phase 10 cross-cutting polish

-- Estimated delivery days — stored on orders (display) and pending_checkouts (pipeline)
alter table public.orders
  add column if not exists estimated_delivery_days int;

alter table public.pending_checkouts
  add column if not exists estimated_delivery_days int;

-- Order events: audit trail for every status change
create table public.order_events (
  id          bigserial primary key,
  order_id    uuid not null references public.orders(id) on delete cascade,
  event_type  text not null,   -- 'created','paid','shipped','delivered','cancelled','refunded','escalated','note','label','message'
  actor_id    uuid references auth.users(id) on delete set null,
  detail      text,            -- human-readable description
  created_at  timestamptz not null default now()
);

create index order_events_order_idx on public.order_events (order_id, created_at desc);

alter table public.order_events enable row level security;

-- Sellers can read events for orders they're involved in
create policy "seller_reads_own_order_events"
  on public.order_events for select to authenticated
  using (exists (
    select 1 from public.order_items oi
    where oi.order_id = order_events.order_id
      and oi.seller_id = auth.uid()
  ));

-- Buyers can read events for their own orders
create policy "buyer_reads_own_order_events"
  on public.order_events for select to authenticated
  using (exists (
    select 1 from public.orders o
    where o.id = order_events.order_id
      and o.user_id = auth.uid()
  ));

-- Insert allowed for authenticated users (gated by app logic)
create policy "authenticated_insert_events"
  on public.order_events for insert to authenticated
  with check (true);

-- Auto-log when order status changes
create or replace function public.log_order_status_change()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if old.status is distinct from new.status then
    insert into public.order_events (order_id, event_type, detail)
    values (new.id, new.status, 'Order status changed to ' || new.status);
  end if;
  return new;
end;
$$;

drop trigger if exists orders_log_status_change on public.orders;
create trigger orders_log_status_change
  after update on public.orders
  for each row execute function public.log_order_status_change();

-- Auto-log when fulfillment status changes on order items
create or replace function public.log_fulfillment_change()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if old.fulfillment_status is distinct from new.fulfillment_status then
    insert into public.order_events (order_id, event_type, actor_id, detail)
    values (
      new.order_id,
      coalesce(new.fulfillment_status, 'pending'),
      auth.uid(),
      coalesce(new.product_name, 'Item') || ' → ' || coalesce(new.fulfillment_status, 'pending')
    );
  end if;
  return new;
end;
$$;

drop trigger if exists order_items_log_fulfillment on public.order_items;
create trigger order_items_log_fulfillment
  after update on public.order_items
  for each row execute function public.log_fulfillment_change();

-- Auto-log order creation
create or replace function public.log_order_created()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.order_events (order_id, event_type, detail)
  values (new.id, 'created', 'Order placed · $' || (new.total_cents / 100.0)::numeric(10,2));
  return new;
end;
$$;

drop trigger if exists orders_log_created on public.orders;
create trigger orders_log_created
  after insert on public.orders
  for each row execute function public.log_order_created();
