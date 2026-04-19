-- ad_placements
CREATE TABLE public.ad_placements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  icon text NOT NULL DEFAULT 'Megaphone',
  internal_price_note text DEFAULT '',
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ad_placements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active placements"
  ON public.ad_placements FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins full access ad_placements"
  ON public.ad_placements FOR ALL
  TO authenticated
  USING (has_role('super_admin'::app_role))
  WITH CHECK (has_role('super_admin'::app_role));

CREATE TRIGGER update_ad_placements_updated_at
  BEFORE UPDATE ON public.ad_placements
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ad_enquiries
CREATE TABLE public.ad_enquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  company text NOT NULL,
  company_url text DEFAULT '',
  company_age text DEFAULT '',
  message text NOT NULL,
  placement_slug text,
  status text NOT NULL DEFAULT 'new',
  admin_notes text DEFAULT '',
  assigned_to uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ad_enquiries ENABLE ROW LEVEL SECURITY;

-- Anyone (including guests) can submit
CREATE POLICY "Public can insert ad_enquiries"
  ON public.ad_enquiries FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins full access ad_enquiries"
  ON public.ad_enquiries FOR ALL
  TO authenticated
  USING (has_role('super_admin'::app_role))
  WITH CHECK (has_role('super_admin'::app_role));

CREATE TRIGGER update_ad_enquiries_updated_at
  BEFORE UPDATE ON public.ad_enquiries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_ad_enquiries_status ON public.ad_enquiries(status);
CREATE INDEX idx_ad_enquiries_created_at ON public.ad_enquiries(created_at DESC);

-- Seed the 6 default placements
INSERT INTO public.ad_placements (slug, title, description, icon, display_order) VALUES
  ('homepage-banner',     'Homepage Banner',         'Premium visibility on the most-visited page',         'Eye',        1),
  ('broker-listing-boost','Broker Listing Boost',    'Featured placement in broker comparison results',     'BarChart3',  2),
  ('signal-channel-sponsor','Signal Channel Sponsor','Sponsored messages to our active trading community', 'Users',      3),
  ('sitewide-banner',     'Sitewide Banner',         'Persistent visibility across all pages',              'Globe',      4),
  ('newsletter-sponsor',  'Newsletter Sponsor',      'Reach our email subscriber base directly',            'Zap',        5),
  ('custom-campaign',     'Custom Campaign',         'Tailored advertising solutions for your brand',       'Target',     6);

-- Seed CMS copy
INSERT INTO public.site_settings (key, value) VALUES (
  'advertise_page',
  jsonb_build_object(
    'eyebrow', 'ADVERTISE WITH US',
    'title', 'Reach',
    'accent', 'Active Traders',
    'subtitle', 'Connect your brand with thousands of traders across forex, crypto, and sports markets.',
    'form_heading', 'Get Started',
    'form_subtitle', 'Fill out the form and our team will schedule a meeting and share our media kit.',
    'success_message', 'Enquiry received! We''ll share our media kit and schedule a meeting within 24 hours.'
  )
) ON CONFLICT (key) DO NOTHING;