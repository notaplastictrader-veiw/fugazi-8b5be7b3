

## Issue
Broker signup fails with "Failed to submit application" because:

1. Email confirmation is **required** → after `supabase.auth.signUp()` the user has NO session (their JWT isn't issued until they click the confirmation email).
2. AuthModal immediately tries to `INSERT` into `applications` with `user_id = data.user.id`.
3. RLS policy "Users can insert own applications" requires `user_id = auth.uid()` → fails because `auth.uid()` is NULL (no session).
4. Fallback policy "Anon can insert applications for existing users" requires `EXISTS (SELECT 1 FROM auth.users WHERE id = user_id)` → also fails because the **anon role has no SELECT permission on `auth.users`**.

Result: insert is blocked by RLS, frontend shows the generic toast.

Confirmed in DB: latest user `ishaqzaade.im@gmail.com` exists in `auth.users` with `email_confirmed_at = NULL`, but `applications` table has 0 rows.

## Fix — SECURITY DEFINER RPC
Create a Postgres function that the anon client can call after signup. Function runs as table owner, bypasses RLS, but safely validates that the supplied `user_id` actually exists in `auth.users` and that no application already exists for them.

```sql
CREATE OR REPLACE FUNCTION public.submit_application(
  _user_id uuid,
  _role text,
  _application_data jsonb,
  _contact_email text,
  _contact_phone text,
  _contact_telegram text
) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  new_id uuid;
BEGIN
  -- Validate user exists
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = _user_id) THEN
    RAISE EXCEPTION 'User not found';
  END IF;
  -- Whitelist roles
  IF _role NOT IN ('signal_provider','broker','betting_site') THEN
    RAISE EXCEPTION 'Invalid role';
  END IF;
  -- Prevent duplicates
  IF EXISTS (SELECT 1 FROM public.applications WHERE user_id = _user_id AND role = _role) THEN
    RAISE EXCEPTION 'Application already submitted';
  END IF;

  INSERT INTO public.applications(user_id, role, application_data, contact_email, contact_phone, contact_telegram, status)
  VALUES (_user_id, _role, _application_data, _contact_email, _contact_phone, _contact_telegram, 'pending')
  RETURNING id INTO new_id;

  RETURN new_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.submit_application(uuid,text,jsonb,text,text,text) TO anon, authenticated;
```

Then drop the unsafe "Anon can insert applications for existing users" policy (no longer needed and was broken anyway).

## Frontend change — `src/components/modals/AuthModal.tsx`
Replace the `.from("applications").insert(...)` call with:
```ts
const { error: appError } = await supabase.rpc("submit_application", {
  _user_id: data.user.id,
  _role: signupRole,
  _application_data: appData,
  _contact_email: signupEmail,
  _contact_phone: `${selectedCountry.dialCode}${phone}`,
  _contact_telegram: telegramLink || null,
});
```
Also surface the actual error message in the toast so future failures are debuggable: `toast.error(appError.message || "Failed to submit application…")`.

## Files Changed
- 1 new migration (RPC + drop unsafe policy)
- `src/components/modals/AuthModal.tsx` (1 small block)

## Out of Scope
- Disabling email confirmation (security regression)
- Refactoring the whole apply-as-X flow into an edge function
- Re-attaching the missing `handle_new_user` trigger (separate audit item)

