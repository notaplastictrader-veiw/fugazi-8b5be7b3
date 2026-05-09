ALTER TABLE public.brokers
  ADD COLUMN IF NOT EXISTS license_number text DEFAULT ''::text,
  ADD COLUMN IF NOT EXISTS withdrawal_time text DEFAULT ''::text,
  ADD COLUMN IF NOT EXISTS withdrawal_fee text DEFAULT ''::text,
  ADD COLUMN IF NOT EXISTS warning_note text DEFAULT ''::text;