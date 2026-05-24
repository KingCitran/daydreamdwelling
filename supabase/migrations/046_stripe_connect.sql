-- 046_stripe_connect.sql
-- Stripe Connect (Express) seller payouts. Without these columns, every
-- charge lands in the platform's single Stripe balance and there's no way
-- to push funds to sellers automatically — they'd have to be paid by
-- manual ACH out of the owner's bank account.
--
-- Flow:
--   1. Seller hits "Get paid" in Settings → frontend calls the
--      stripe-connect-onboard edge function.
--   2. That function calls stripe.accounts.create({type:'express',...}),
--      stores the returned acct_xxx id on profiles.stripe_account_id, and
--      returns a Stripe-hosted onboarding URL (account link).
--   3. Seller completes Stripe's KYC + bank details on Stripe's hosted UI.
--   4. Seller returns to /settings?stripe=return — frontend calls
--      stripe-connect-refresh, which re-fetches the account from Stripe
--      and updates the charges_enabled / payouts_enabled / details_submitted
--      flags via the SECURITY DEFINER set_stripe_account_status RPC.
--   5. When create-checkout builds a single-seller Stripe Checkout session
--      and the seller's charges_enabled = true, it uses a destination
--      charge (transfer_data.destination = stripe_account_id) with an
--      application_fee_amount. Stripe handles the split automatically;
--      money lands in the seller's connected account and the platform's
--      fee lands in the platform balance.

alter table public.profiles
  add column if not exists stripe_account_id          text,
  add column if not exists stripe_charges_enabled     boolean not null default false,
  add column if not exists stripe_payouts_enabled     boolean not null default false,
  add column if not exists stripe_details_submitted   boolean not null default false,
  add column if not exists stripe_onboarding_started_at timestamptz,
  add column if not exists stripe_onboarded_at        timestamptz;

create unique index if not exists idx_profiles_stripe_account
  on public.profiles (stripe_account_id) where stripe_account_id is not null;

-- RPC for the stripe-connect-refresh edge function to write status flags.
-- Caller-scoped (auth.uid()) so we don't have to trust client-supplied
-- profile ids; the edge function forwards the seller's JWT and this RPC
-- updates only that caller's row.
create or replace function public.set_stripe_account_status(
  p_charges_enabled    boolean,
  p_payouts_enabled    boolean,
  p_details_submitted  boolean
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Must be authenticated';
  end if;
  update public.profiles set
    stripe_charges_enabled    = p_charges_enabled,
    stripe_payouts_enabled    = p_payouts_enabled,
    stripe_details_submitted  = p_details_submitted,
    stripe_onboarded_at = case
      when p_details_submitted and stripe_onboarded_at is null then now()
      else stripe_onboarded_at
    end
  where id = auth.uid();
end;
$$;

revoke all on function public.set_stripe_account_status(boolean, boolean, boolean) from public;
grant execute on function public.set_stripe_account_status(boolean, boolean, boolean) to authenticated;

-- A second RPC the onboard function uses to stamp stripe_account_id +
-- stripe_onboarding_started_at on first-time onboard. Same caller-gating.
create or replace function public.stamp_stripe_account_id(p_account_id text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Must be authenticated';
  end if;
  if p_account_id is null or p_account_id !~ '^acct_[A-Za-z0-9]+$' then
    raise exception 'Invalid stripe account id';
  end if;
  update public.profiles set
    stripe_account_id            = p_account_id,
    stripe_onboarding_started_at = coalesce(stripe_onboarding_started_at, now())
  where id = auth.uid()
    and (stripe_account_id is null or stripe_account_id = p_account_id);
end;
$$;

revoke all on function public.stamp_stripe_account_id(text) from public;
grant execute on function public.stamp_stripe_account_id(text) to authenticated;
