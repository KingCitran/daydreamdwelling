-- Extend contests for product placement challenges and client briefs

-- Contest type: 'theme' (existing), 'placement' (required items), 'brief' (budget + category)
alter table public.contests add column if not exists contest_type text not null default 'theme'
  check (contest_type in ('theme', 'placement', 'brief'));

-- Product placement: list of product IDs that entries must include
alter table public.contests add column if not exists required_items uuid[] default '{}';

-- Sponsor: seller who is sponsoring the contest (their products featured)
alter table public.contests add column if not exists sponsor_id uuid references public.profiles(id);

-- Client brief: budget constraint and required categories
alter table public.contests add column if not exists budget_limit numeric;
alter table public.contests add column if not exists required_categories text[] default '{}';

-- Prize pool (could be store credit, loyalty points, featured placement)
alter table public.contests add column if not exists prize_description text;
alter table public.contests add column if not exists prize_credit numeric default 0;
