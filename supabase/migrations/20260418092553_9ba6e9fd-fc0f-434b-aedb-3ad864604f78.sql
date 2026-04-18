
-- 1. Backfill claim_status to 'claimed' (valid value) for all upgraded profiles
UPDATE public.broker_profiles  SET claim_status='claimed' WHERE tier IN ('verified','featured') AND claim_status NOT IN ('claimed');
UPDATE public.signal_profiles  SET claim_status='claimed' WHERE tier IN ('verified','featured') AND claim_status NOT IN ('claimed');
UPDATE public.betting_profiles SET claim_status='claimed' WHERE tier IN ('verified','featured') AND claim_status NOT IN ('claimed');

-- 2. Extend sync_tier_flags() trigger to also sync claim_status='claimed' when tier upgraded
CREATE OR REPLACE FUNCTION public.sync_tier_flags()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  NEW.is_verified := (NEW.tier IN ('verified', 'featured'));
  NEW.is_featured := (NEW.tier = 'featured');
  IF NEW.tier IN ('verified', 'featured') AND COALESCE(NEW.claim_status, '') <> 'claimed' THEN
    NEW.claim_status := 'claimed';
  END IF;
  RETURN NEW;
END;
$function$;

-- 3. Refactor RLS policies on review_replies — gate on tier, not claim_status
DROP POLICY IF EXISTS "Broker owner can insert reply" ON public.review_replies;
DROP POLICY IF EXISTS "Broker owner can update own reply" ON public.review_replies;
DROP POLICY IF EXISTS "Broker owner can delete own reply" ON public.review_replies;

CREATE POLICY "Broker owner can insert reply"
ON public.review_replies
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid() AND EXISTS (
    SELECT 1 FROM public.broker_profiles bp
    WHERE bp.broker_id = review_replies.broker_id
      AND bp.claimed_by = auth.uid()
      AND bp.tier IN ('verified','featured')
  )
);

CREATE POLICY "Broker owner can update own reply"
ON public.review_replies
FOR UPDATE
TO authenticated
USING (
  user_id = auth.uid() AND EXISTS (
    SELECT 1 FROM public.broker_profiles bp
    WHERE bp.broker_id = review_replies.broker_id
      AND bp.claimed_by = auth.uid()
      AND bp.tier IN ('verified','featured')
  )
)
WITH CHECK (
  user_id = auth.uid() AND EXISTS (
    SELECT 1 FROM public.broker_profiles bp
    WHERE bp.broker_id = review_replies.broker_id
      AND bp.claimed_by = auth.uid()
      AND bp.tier IN ('verified','featured')
  )
);

CREATE POLICY "Broker owner can delete own reply"
ON public.review_replies
FOR DELETE
TO authenticated
USING (
  user_id = auth.uid() AND EXISTS (
    SELECT 1 FROM public.broker_profiles bp
    WHERE bp.broker_id = review_replies.broker_id
      AND bp.claimed_by = auth.uid()
      AND bp.tier IN ('verified','featured')
  )
);

-- 4. Refactor RLS policies on review_reads — gate on tier, not claim_status
DROP POLICY IF EXISTS "Broker owner can insert own reads" ON public.review_reads;
DROP POLICY IF EXISTS "Broker owner can view own reads" ON public.review_reads;

CREATE POLICY "Broker owner can insert own reads"
ON public.review_reads
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid() AND EXISTS (
    SELECT 1 FROM public.broker_profiles bp
    WHERE bp.broker_id = review_reads.broker_id
      AND bp.claimed_by = auth.uid()
      AND bp.tier IN ('verified','featured')
  )
);

CREATE POLICY "Broker owner can view own reads"
ON public.review_reads
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() AND EXISTS (
    SELECT 1 FROM public.broker_profiles bp
    WHERE bp.broker_id = review_reads.broker_id
      AND bp.claimed_by = auth.uid()
      AND bp.tier IN ('verified','featured')
  )
);
