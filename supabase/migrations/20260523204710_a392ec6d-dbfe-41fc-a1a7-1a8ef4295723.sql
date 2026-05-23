
-- 1) Recreate views with security_invoker so RLS of the querying user applies
ALTER VIEW public.ad_placements_public SET (security_invoker = true);
ALTER VIEW public.betting_profiles_public SET (security_invoker = true);
ALTER VIEW public.broker_profiles_public SET (security_invoker = true);
ALTER VIEW public.profiles_public SET (security_invoker = true);
ALTER VIEW public.signal_profiles_public SET (security_invoker = true);

-- 2) Reviews: prevent users from self-publishing
DROP POLICY IF EXISTS "Users can insert own reviews" ON public.reviews;
CREATE POLICY "Users can insert own reviews"
ON public.reviews
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND status = 'pending'::content_status
);

-- 3) Referral clicks: hardened RPC + remove open insert policies
CREATE OR REPLACE FUNCTION public.record_referral_click(
  _code text,
  _user_agent text DEFAULT NULL,
  _referrer_url text DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_code_id uuid;
BEGIN
  IF _code IS NULL OR length(_code) < 4 OR length(_code) > 64 THEN
    RETURN;
  END IF;

  SELECT id INTO v_code_id FROM public.referral_codes WHERE code = _code LIMIT 1;
  IF v_code_id IS NULL THEN RETURN; END IF;

  INSERT INTO public.referral_clicks (referral_code_id, user_agent, referrer_url)
  VALUES (v_code_id, left(coalesce(_user_agent,''), 500), left(coalesce(_referrer_url,''), 500));

  UPDATE public.referral_codes SET clicks = clicks + 1 WHERE id = v_code_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.record_referral_click(text, text, text) TO anon, authenticated;

DROP POLICY IF EXISTS "Anon can insert referral_clicks" ON public.referral_clicks;
DROP POLICY IF EXISTS "Auth can insert referral_clicks" ON public.referral_clicks;
