
-- Promotions table
CREATE TABLE public.promotions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  broker_id UUID REFERENCES public.brokers(id) ON DELETE SET NULL,
  promo_type TEXT NOT NULL DEFAULT 'bonus',
  bonus_amount TEXT DEFAULT '',
  expiry_date DATE,
  link_url TEXT DEFAULT '',
  image_url TEXT DEFAULT '',
  is_featured BOOLEAN DEFAULT false,
  status public.content_status NOT NULL DEFAULT 'draft',
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER update_promotions_updated_at BEFORE UPDATE ON public.promotions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Public can view published promotions" ON public.promotions
  FOR SELECT TO anon, authenticated USING (status = 'published');
CREATE POLICY "Admins full access promotions" ON public.promotions
  FOR ALL TO authenticated USING (has_role('super_admin')) WITH CHECK (has_role('super_admin'));

-- News articles table
CREATE TABLE public.news_articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT DEFAULT '',
  content TEXT DEFAULT '',
  category TEXT NOT NULL DEFAULT 'market',
  source_url TEXT DEFAULT '',
  image_url TEXT DEFAULT '',
  author TEXT DEFAULT 'NAPT Editorial',
  status public.content_status NOT NULL DEFAULT 'draft',
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER update_news_articles_updated_at BEFORE UPDATE ON public.news_articles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Public can view published news" ON public.news_articles
  FOR SELECT TO anon, authenticated USING (status = 'published');
CREATE POLICY "Admins full access news" ON public.news_articles
  FOR ALL TO authenticated USING (has_role('super_admin')) WITH CHECK (has_role('super_admin'));

-- Calendar events table
CREATE TABLE public.calendar_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  event_date DATE NOT NULL,
  event_time TIME,
  impact TEXT NOT NULL DEFAULT 'medium',
  currency TEXT DEFAULT '',
  category TEXT NOT NULL DEFAULT 'economic',
  actual_value TEXT DEFAULT '',
  forecast_value TEXT DEFAULT '',
  previous_value TEXT DEFAULT '',
  status public.content_status NOT NULL DEFAULT 'draft',
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER update_calendar_events_updated_at BEFORE UPDATE ON public.calendar_events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Public can view published calendar_events" ON public.calendar_events
  FOR SELECT TO anon, authenticated USING (status = 'published');
CREATE POLICY "Admins full access calendar_events" ON public.calendar_events
  FOR ALL TO authenticated USING (has_role('super_admin')) WITH CHECK (has_role('super_admin'));

-- Sports predictions table
CREATE TABLE public.sports_predictions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  sport TEXT NOT NULL DEFAULT 'football',
  team_a TEXT NOT NULL DEFAULT '',
  team_b TEXT NOT NULL DEFAULT '',
  match_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  prediction TEXT NOT NULL DEFAULT '',
  confidence INTEGER DEFAULT 70,
  analyst_note TEXT DEFAULT '',
  result TEXT DEFAULT '',
  is_correct BOOLEAN,
  status public.content_status NOT NULL DEFAULT 'draft',
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER update_sports_predictions_updated_at BEFORE UPDATE ON public.sports_predictions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Public can view published sports_predictions" ON public.sports_predictions
  FOR SELECT TO anon, authenticated USING (status = 'published');
CREATE POLICY "Admins full access sports_predictions" ON public.sports_predictions
  FOR ALL TO authenticated USING (has_role('super_admin')) WITH CHECK (has_role('super_admin'));
