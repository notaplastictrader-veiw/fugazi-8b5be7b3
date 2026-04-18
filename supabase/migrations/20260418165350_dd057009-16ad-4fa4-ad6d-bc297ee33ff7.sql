-- Promotions: detail page fields
ALTER TABLE public.promotions
  ADD COLUMN IF NOT EXISTS slug text,
  ADD COLUMN IF NOT EXISTS full_description text DEFAULT '',
  ADD COLUMN IF NOT EXISTS how_to_claim text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS terms text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS broker_name text DEFAULT '',
  ADD COLUMN IF NOT EXISTS referral_url text DEFAULT '';

-- Backfill slugs for existing rows from title
UPDATE public.promotions
   SET slug = lower(regexp_replace(coalesce(title, id::text), '[^a-zA-Z0-9]+', '-', 'g'))
 WHERE slug IS NULL OR slug = '';

-- Make slug unique going forward
CREATE UNIQUE INDEX IF NOT EXISTS promotions_slug_key ON public.promotions (slug);

-- Scam alerts: investigation fields
ALTER TABLE public.scam_alerts
  ADD COLUMN IF NOT EXISTS is_repeat_offender boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS show_full_report boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS full_report text DEFAULT '';