-- Add contact fields, backfill existing rows, then enforce NOT NULL
ALTER TABLE public.support_messages
  ADD COLUMN IF NOT EXISTS contact_name text,
  ADD COLUMN IF NOT EXISTS contact_email text,
  ADD COLUMN IF NOT EXISTS contact_phone text;

UPDATE public.support_messages
   SET contact_name  = COALESCE(contact_name, 'Unknown'),
       contact_email = COALESCE(contact_email, 'unknown@example.com'),
       contact_phone = COALESCE(contact_phone, 'N/A')
 WHERE contact_name IS NULL
    OR contact_email IS NULL
    OR contact_phone IS NULL;

ALTER TABLE public.support_messages
  ALTER COLUMN contact_name SET NOT NULL,
  ALTER COLUMN contact_email SET NOT NULL,
  ALTER COLUMN contact_phone SET NOT NULL;