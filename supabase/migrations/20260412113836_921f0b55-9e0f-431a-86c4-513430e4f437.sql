
CREATE OR REPLACE FUNCTION public.convert_referral(code_text text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_code_id uuid;
  v_owner_id uuid;
BEGIN
  -- Look up the referral code
  SELECT id, user_id INTO v_code_id, v_owner_id
  FROM public.referral_codes
  WHERE code = code_text;

  IF v_code_id IS NULL THEN
    RETURN NULL;
  END IF;

  -- Increment conversions
  UPDATE public.referral_codes
  SET conversions = conversions + 1, updated_at = now()
  WHERE id = v_code_id;

  -- Mark the latest unconverted click as converted
  UPDATE public.referral_clicks
  SET converted = true
  WHERE id = (
    SELECT id FROM public.referral_clicks
    WHERE referral_code_id = v_code_id AND converted = false
    ORDER BY created_at DESC
    LIMIT 1
  );

  RETURN v_owner_id;
END;
$$;
