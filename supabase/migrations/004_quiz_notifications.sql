-- Migration 004: Quiz style preferences + buyer notifications
-- Apply via: supabase db push  (or paste into Supabase SQL editor)

-- 1. Add style_tags to profiles
--    Stores the buyer's taste profile derived from the onboarding quiz.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS style_tags text[] NOT NULL DEFAULT '{}';

-- 2. Notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id                 uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id            uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type               text        NOT NULL DEFAULT 'product_match',
  title              text        NOT NULL,
  body               text,
  related_product_id uuid        REFERENCES public.products(id) ON DELETE SET NULL,
  related_seller_id  uuid        REFERENCES public.profiles(id) ON DELETE SET NULL,
  read               boolean     NOT NULL DEFAULT false,
  created_at         timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS notifications_user_read_idx
  ON public.notifications (user_id, read);

-- 3. RLS: buyers can only see and update their own notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users see own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "users mark own notifications read"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 4. Trigger: create notifications for matching buyers when a product goes active
CREATE OR REPLACE FUNCTION public.notify_matching_buyers()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  product_style_tags text[];
BEGIN
  -- Only fire when status flips to 'active'
  IF NEW.status = 'active' AND (OLD.status IS DISTINCT FROM 'active') THEN
    -- Collect the product's style tags
    SELECT ARRAY_AGG(pt.value)
      INTO product_style_tags
      FROM public.product_tags pt
     WHERE pt.product_id = NEW.id
       AND pt.tag_type = 'style';

    -- Nothing to match if the product has no style tags
    IF product_style_tags IS NULL OR array_length(product_style_tags, 1) = 0 THEN
      RETURN NEW;
    END IF;

    -- Insert one notification per matching buyer (skip the seller themselves)
    INSERT INTO public.notifications
      (user_id, type, title, body, related_product_id, related_seller_id)
    SELECT DISTINCT
      p.id,
      'product_match',
      'New arrival matches your style',
      NEW.name,
      NEW.id,
      NEW.seller_id
    FROM public.profiles p
    WHERE p.id != NEW.seller_id
      AND p.style_tags && product_style_tags;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_product_activated ON public.products;
CREATE TRIGGER on_product_activated
  AFTER UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_matching_buyers();
