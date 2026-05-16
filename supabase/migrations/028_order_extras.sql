-- 028_order_extras.sql
-- Seller-private notes + pre-ship photo on order_items. Pre-ship photo is the
-- trust/damage-proof play: seller snaps a photo of packed item before shipping,
-- buyer sees it in their order detail. Counters return fraud and gives clear
-- baseline if buyer receives damaged item.

alter table public.order_items
  add column if not exists seller_note               text,
  add column if not exists pre_ship_photo_path       text,
  add column if not exists pre_ship_photo_uploaded_at timestamptz;
