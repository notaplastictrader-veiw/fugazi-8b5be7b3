
CREATE OR REPLACE FUNCTION public.increment_referral_clicks(code_id UUID)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.referral_codes
  SET clicks = clicks + 1
  WHERE id = code_id;
$$;
