ALTER TABLE public.brokers
  ADD COLUMN IF NOT EXISTS show_on_homepage boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS homepage_position integer;

CREATE INDEX IF NOT EXISTS idx_brokers_homepage
  ON public.brokers (show_on_homepage, homepage_position)
  WHERE show_on_homepage = true;