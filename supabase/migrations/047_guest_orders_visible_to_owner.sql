-- 047_guest_orders_visible_to_owner.sql
-- Lets a logged-in user see orders that were placed as a guest against
-- their email address. Without this, any order placed before we started
-- stamping user_id on signed-in checkouts (or any order placed in another
-- browser session without login) is invisible to the user even though
-- they're clearly the buyer.
--
-- RLS check: the order has no user_id (guest), and its guest_email matches
-- the current JWT's email claim. We use auth.jwt() ->> 'email' rather than
-- a subquery on auth.users to avoid policy recursion.

create policy "Users can view guest orders matching their email" on public.orders
  for select using (
    user_id is null
    and guest_email is not null
    and guest_email = (auth.jwt() ->> 'email')
  );
