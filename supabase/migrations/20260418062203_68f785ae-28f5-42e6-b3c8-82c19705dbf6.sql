-- Drop the broken anonymous insert policy
DROP POLICY IF EXISTS "Anon can insert applications for existing users" ON public.applications;

-- Create SECURITY DEFINER function for safe application submission
CREATE OR REPLACE FUNCTION public.submit_application(
  _user_id uuid,
  _role text,
  _application_data jsonb,
  _contact_email text,
  _contact_phone text,
  _contact_telegram text
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_id uuid;
BEGIN
  -- Validate user exists
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = _user_id) THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  -- Whitelist allowed roles
  IF _role NOT IN ('signal_provider', 'broker', 'betting_site') THEN
    RAISE EXCEPTION 'Invalid role';
  END IF;

  -- Prevent duplicate applications
  IF EXISTS (
    SELECT 1 FROM public.applications
    WHERE user_id = _user_id AND role = _role
  ) THEN
    RAISE EXCEPTION 'Application already submitted';
  END IF;

  INSERT INTO public.applications (
    user_id, role, application_data,
    contact_email, contact_phone, contact_telegram, status
  )
  VALUES (
    _user_id, _role, _application_data,
    _contact_email, _contact_phone, _contact_telegram, 'pending'
  )
  RETURNING id INTO new_id;

  RETURN new_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.submit_application(uuid, text, jsonb, text, text, text) TO anon, authenticated;