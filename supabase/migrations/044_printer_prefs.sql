-- 044_printer_prefs.sql
-- Seller-set printer name reminders. Browsers can't programmatically pick
-- the destination printer (security boundary), but they DO remember the
-- last printer used per page-size + host. We set @page size correctly in
-- the print CSS (4x6 for labels, letter for slips) so the browser's print
-- dialog defaults to the right printer after the first manual selection.
-- These free-text fields show as reminders in the print window so the
-- seller knows which printer they intended to use.

alter table public.profiles
  add column if not exists label_printer_name    text,
  add column if not exists document_printer_name text;
