CREATE TABLE public.ad_campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  placement_slug TEXT NOT NULL,
  sponsor_name TEXT NOT NULL,
  sponsor_logo_url TEXT DEFAULT '',
  headline TEXT NOT NULL DEFAULT '',
  subtext TEXT DEFAULT '',
  cta_label TEXT DEFAULT 'Learn More',
  cta_url TEXT DEFAULT '#',
  image_url TEXT DEFAULT '',
  is_active BOOLEAN NOT NULL DEFAULT true,
  start_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  end_date TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '90 days'),
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_ad_campaigns_placement ON public.ad_campaigns(placement_slug);
CREATE INDEX idx_ad_campaigns_active ON public.ad_campaigns(is_active, start_date, end_date);

ALTER TABLE public.ad_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view live campaigns"
  ON public.ad_campaigns FOR SELECT
  TO anon, authenticated
  USING (is_active = true AND now() BETWEEN start_date AND end_date);

CREATE POLICY "Admins full access ad_campaigns"
  ON public.ad_campaigns FOR ALL
  TO authenticated
  USING (has_role('super_admin'::app_role))
  WITH CHECK (has_role('super_admin'::app_role));

CREATE TRIGGER update_ad_campaigns_updated_at
  BEFORE UPDATE ON public.ad_campaigns
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();