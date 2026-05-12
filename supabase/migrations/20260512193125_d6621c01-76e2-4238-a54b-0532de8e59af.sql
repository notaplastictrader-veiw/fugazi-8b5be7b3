ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS account_proof_url TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS account_id_masked TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS verified_account BOOLEAN NOT NULL DEFAULT false;