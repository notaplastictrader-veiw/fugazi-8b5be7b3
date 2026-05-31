
-- Add admin-controlled verified trader flag
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_verified_trader boolean NOT NULL DEFAULT false;

-- Backfill: users who have authored a published review keep their current access
UPDATE public.profiles p
   SET is_verified_trader = true
 WHERE EXISTS (
   SELECT 1 FROM public.reviews r
    WHERE r.user_id = p.user_id AND r.status = 'published'
 );

-- Replace function to check the explicit admin-controlled flag
CREATE OR REPLACE FUNCTION public.is_verified_trader(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT COALESCE((SELECT is_verified_trader FROM public.profiles WHERE user_id = _user_id), false);
$$;
