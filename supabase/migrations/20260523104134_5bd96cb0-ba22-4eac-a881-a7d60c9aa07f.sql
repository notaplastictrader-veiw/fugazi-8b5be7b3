
ALTER TABLE public.brokers
  ADD COLUMN IF NOT EXISTS naft_verified boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS naft_verified_at timestamptz,
  ADD COLUMN IF NOT EXISTS naft_verified_by uuid;

ALTER TABLE public.scam_alerts
  ADD COLUMN IF NOT EXISTS naft_verified boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS naft_verified_at timestamptz,
  ADD COLUMN IF NOT EXISTS naft_verified_by uuid;

ALTER TABLE public.promotions
  ADD COLUMN IF NOT EXISTS naft_verified boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS naft_verified_at timestamptz,
  ADD COLUMN IF NOT EXISTS naft_verified_by uuid;

ALTER TABLE public.betting_sites
  ADD COLUMN IF NOT EXISTS naft_verified boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS naft_verified_at timestamptz,
  ADD COLUMN IF NOT EXISTS naft_verified_by uuid;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='signal_groups') THEN
    EXECUTE 'ALTER TABLE public.signal_groups
      ADD COLUMN IF NOT EXISTS naft_verified boolean NOT NULL DEFAULT false,
      ADD COLUMN IF NOT EXISTS naft_verified_at timestamptz,
      ADD COLUMN IF NOT EXISTS naft_verified_by uuid';
  END IF;
END$$;
