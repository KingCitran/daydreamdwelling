-- Lower the PPC click-through rate from 15¢ to 2¢. Industry comp: ~4× streaming
-- royalties (~$0.005), 1/2.5 of typical affiliate clicks ($0.05+). Quantity-over-
-- quality framing — artists' deposits go further, more music can join.
-- See plan: C:\Users\danbe\.claude\plans\humming-velvet-tide.md

alter table public.artist_profiles
  alter column ppc_rate_cents set default 2;

update public.artist_profiles
  set ppc_rate_cents = 2
  where ppc_rate_cents = 15;
