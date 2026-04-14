
-- =============================================
-- NAFT COMPLETE DATABASE SCHEMA
-- =============================================

-- 1. Enums
CREATE TYPE public.app_role AS ENUM ('super_admin', 'content_ops', 'moderator', 'user', 'broker', 'signal_provider', 'betting_site');
CREATE TYPE public.content_status AS ENUM ('draft', 'pending', 'published', 'rejected');

-- 2. user_roles
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 3. has_role() function (single-arg, uses auth.uid())
CREATE OR REPLACE FUNCTION public.has_role(_role app_role)
  RETURNS boolean
  LANGUAGE sql STABLE SECURITY DEFINER
  SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = _role
  );
$$;

-- user_roles policies
CREATE POLICY "Super admins can manage all roles" ON public.user_roles FOR ALL TO authenticated
  USING (has_role('super_admin'::app_role)) WITH CHECK (has_role('super_admin'::app_role));
CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- 4. Timestamp trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

-- 5. brokers
CREATE TABLE public.brokers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, slug TEXT NOT NULL UNIQUE, type TEXT NOT NULL DEFAULT 'forex',
  tags TEXT[] DEFAULT '{}', regulation TEXT[] DEFAULT '{}',
  score NUMERIC(3,1) DEFAULT 0, avg_spread TEXT DEFAULT '0',
  leverage TEXT DEFAULT '1:100', min_deposit TEXT DEFAULT '$0',
  stars NUMERIC(2,1) DEFAULT 0, review_count INT DEFAULT 0, complaints INT DEFAULT 0,
  badge TEXT DEFAULT 'none', logo_url TEXT,
  status content_status NOT NULL DEFAULT 'draft',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.brokers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view published brokers" ON public.brokers FOR SELECT TO anon, authenticated USING (status = 'published');
CREATE POLICY "Admins full access brokers" ON public.brokers FOR ALL TO authenticated USING (has_role('super_admin'::app_role)) WITH CHECK (has_role('super_admin'::app_role));

-- 6. signal_groups
CREATE TABLE public.signal_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, win_rate INT DEFAULT 0, monthly_signals TEXT DEFAULT '0',
  avg_rr TEXT DEFAULT '1:1', track_record TEXT DEFAULT '', members TEXT DEFAULT '0',
  verified BOOLEAN DEFAULT false, status content_status NOT NULL DEFAULT 'draft',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.signal_groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view published signals" ON public.signal_groups FOR SELECT TO anon, authenticated USING (status = 'published');
CREATE POLICY "Admins full access signals" ON public.signal_groups FOR ALL TO authenticated USING (has_role('super_admin'::app_role)) WITH CHECK (has_role('super_admin'::app_role));

-- 7. forecasts
CREATE TABLE public.forecasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pair TEXT NOT NULL, direction TEXT NOT NULL DEFAULT 'bullish', potential TEXT NOT NULL DEFAULT 'MED',
  reasoning TEXT DEFAULT '', updated_label TEXT DEFAULT '', category TEXT NOT NULL DEFAULT 'forex',
  status content_status NOT NULL DEFAULT 'draft', created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.forecasts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view published forecasts" ON public.forecasts FOR SELECT TO anon, authenticated USING (status = 'published');
CREATE POLICY "Admins full access forecasts" ON public.forecasts FOR ALL TO authenticated USING (has_role('super_admin'::app_role)) WITH CHECK (has_role('super_admin'::app_role));

-- 8. reviews
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  broker_id UUID REFERENCES public.brokers(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id), rating INT DEFAULT 5,
  author TEXT DEFAULT 'Anonymous', content TEXT DEFAULT '', avatar TEXT DEFAULT '',
  role TEXT DEFAULT 'Trader', status content_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view published reviews" ON public.reviews FOR SELECT TO anon, authenticated USING (status = 'published');
CREATE POLICY "Users can insert own reviews" ON public.reviews FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admins full access reviews" ON public.reviews FOR ALL TO authenticated USING (has_role('super_admin'::app_role)) WITH CHECK (has_role('super_admin'::app_role));

-- 9. complaints
CREATE TABLE public.complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  broker_id UUID REFERENCES public.brokers(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id), content TEXT DEFAULT '',
  proof_urls TEXT[] DEFAULT '{}', status content_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view published complaints" ON public.complaints FOR SELECT TO anon, authenticated USING (status = 'published');
CREATE POLICY "Users can insert own complaints" ON public.complaints FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admins full access complaints" ON public.complaints FOR ALL TO authenticated USING (has_role('super_admin'::app_role)) WITH CHECK (has_role('super_admin'::app_role));

-- 10. scam_alerts
CREATE TABLE public.scam_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  broker_id UUID REFERENCES public.brokers(id) ON DELETE SET NULL,
  severity TEXT NOT NULL DEFAULT 'medium', title TEXT NOT NULL DEFAULT '', description TEXT DEFAULT '',
  status content_status NOT NULL DEFAULT 'draft', created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.scam_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view published scam_alerts" ON public.scam_alerts FOR SELECT TO anon, authenticated USING (status = 'published');
CREATE POLICY "Admins full access scam_alerts" ON public.scam_alerts FOR ALL TO authenticated USING (has_role('super_admin'::app_role)) WITH CHECK (has_role('super_admin'::app_role));

-- 11. site_settings
CREATE TABLE public.site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE, value JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_by UUID REFERENCES auth.users(id)
);
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read site_settings" ON public.site_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins can manage site_settings" ON public.site_settings FOR ALL TO authenticated USING (has_role('super_admin'::app_role)) WITH CHECK (has_role('super_admin'::app_role));

-- 12. approval_queue
CREATE TABLE public.approval_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type TEXT NOT NULL, content_id UUID NOT NULL,
  submitted_by UUID REFERENCES auth.users(id), status TEXT NOT NULL DEFAULT 'pending',
  reviewer_notes TEXT DEFAULT '', reviewed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), reviewed_at TIMESTAMPTZ,
  priority INT DEFAULT 3, escalated_by UUID REFERENCES auth.users(id),
  escalated_at TIMESTAMPTZ, rejection_reason TEXT
);
ALTER TABLE public.approval_queue ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins full access approval_queue" ON public.approval_queue FOR ALL TO authenticated USING (has_role('super_admin'::app_role)) WITH CHECK (has_role('super_admin'::app_role));
CREATE POLICY "Users can view own submissions" ON public.approval_queue FOR SELECT TO authenticated USING (submitted_by = auth.uid());

-- 13. profiles (extended with profile system fields)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT, phone TEXT, country_code TEXT, country TEXT, avatar_url TEXT,
  username TEXT UNIQUE, bio TEXT, trading_style TEXT, experience_level TEXT,
  social_telegram TEXT, social_twitter TEXT,
  is_public BOOLEAN DEFAULT true, show_real_name BOOLEAN DEFAULT true,
  show_country BOOLEAN DEFAULT true, show_complaints BOOLEAN DEFAULT true,
  reputation_score INT DEFAULT 0, reputation_tier TEXT DEFAULT 'New Trader',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT profiles_username_format CHECK (username IS NULL OR username ~ '^[a-zA-Z0-9_]{3,20}$')
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Public profiles are viewable" ON public.profiles FOR SELECT USING (is_public = true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins full access profiles" ON public.profiles FOR ALL TO authenticated USING (has_role('super_admin'::app_role)) WITH CHECK (has_role('super_admin'::app_role));

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 14. applications
CREATE TABLE public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'pending',
  application_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  contact_email TEXT, contact_phone TEXT, contact_telegram TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins full access applications" ON public.applications FOR ALL TO authenticated USING (has_role('super_admin'::app_role)) WITH CHECK (has_role('super_admin'::app_role));
CREATE POLICY "Users can view own applications" ON public.applications FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert own applications" ON public.applications FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON public.applications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 15. promotions
CREATE TABLE public.promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL, description TEXT DEFAULT '', broker_id UUID REFERENCES public.brokers(id) ON DELETE SET NULL,
  promo_type TEXT NOT NULL DEFAULT 'bonus', bonus_amount TEXT DEFAULT '', expiry_date DATE,
  link_url TEXT DEFAULT '', image_url TEXT DEFAULT '', is_featured BOOLEAN DEFAULT false,
  status content_status NOT NULL DEFAULT 'draft', created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER update_promotions_updated_at BEFORE UPDATE ON public.promotions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE POLICY "Public can view published promotions" ON public.promotions FOR SELECT TO anon, authenticated USING (status = 'published');
CREATE POLICY "Admins full access promotions" ON public.promotions FOR ALL TO authenticated USING (has_role('super_admin'::app_role)) WITH CHECK (has_role('super_admin'::app_role));

-- 16. news_articles
CREATE TABLE public.news_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL, slug TEXT NOT NULL UNIQUE, excerpt TEXT DEFAULT '', content TEXT DEFAULT '',
  category TEXT NOT NULL DEFAULT 'market', source_url TEXT DEFAULT '', image_url TEXT DEFAULT '',
  author TEXT DEFAULT 'NAPT Editorial', status content_status NOT NULL DEFAULT 'draft', created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.news_articles ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER update_news_articles_updated_at BEFORE UPDATE ON public.news_articles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE POLICY "Public can view published news" ON public.news_articles FOR SELECT TO anon, authenticated USING (status = 'published');
CREATE POLICY "Admins full access news" ON public.news_articles FOR ALL TO authenticated USING (has_role('super_admin'::app_role)) WITH CHECK (has_role('super_admin'::app_role));

-- 17. calendar_events
CREATE TABLE public.calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL, description TEXT DEFAULT '', event_date DATE NOT NULL, event_time TIME,
  impact TEXT NOT NULL DEFAULT 'medium', currency TEXT DEFAULT '', category TEXT NOT NULL DEFAULT 'economic',
  actual_value TEXT DEFAULT '', forecast_value TEXT DEFAULT '', previous_value TEXT DEFAULT '',
  status content_status NOT NULL DEFAULT 'draft', created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER update_calendar_events_updated_at BEFORE UPDATE ON public.calendar_events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE POLICY "Public can view published calendar_events" ON public.calendar_events FOR SELECT TO anon, authenticated USING (status = 'published');
CREATE POLICY "Admins full access calendar_events" ON public.calendar_events FOR ALL TO authenticated USING (has_role('super_admin'::app_role)) WITH CHECK (has_role('super_admin'::app_role));

-- 18. sports_predictions
CREATE TABLE public.sports_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL, sport TEXT NOT NULL DEFAULT 'football',
  team_a TEXT NOT NULL DEFAULT '', team_b TEXT NOT NULL DEFAULT '',
  match_date TIMESTAMPTZ NOT NULL DEFAULT now(), prediction TEXT NOT NULL DEFAULT '',
  confidence INTEGER DEFAULT 70, analyst_note TEXT DEFAULT '', result TEXT DEFAULT '',
  is_correct BOOLEAN, status content_status NOT NULL DEFAULT 'draft', created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.sports_predictions ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER update_sports_predictions_updated_at BEFORE UPDATE ON public.sports_predictions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE POLICY "Public can view published sports_predictions" ON public.sports_predictions FOR SELECT TO anon, authenticated USING (status = 'published');
CREATE POLICY "Admins full access sports_predictions" ON public.sports_predictions FOR ALL TO authenticated USING (has_role('super_admin'::app_role)) WITH CHECK (has_role('super_admin'::app_role));

-- 19. watchlist
CREATE TABLE public.watchlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL, broker_id UUID NOT NULL REFERENCES public.brokers(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), UNIQUE (user_id, broker_id)
);
ALTER TABLE public.watchlist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own watchlist" ON public.watchlist FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can add to own watchlist" ON public.watchlist FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can remove from own watchlist" ON public.watchlist FOR DELETE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins full access watchlist" ON public.watchlist FOR ALL TO authenticated USING (has_role('super_admin'::app_role)) WITH CHECK (has_role('super_admin'::app_role));
CREATE INDEX idx_watchlist_user_id ON public.watchlist(user_id);
CREATE INDEX idx_watchlist_broker_id ON public.watchlist(broker_id);

-- 20. user_activity
CREATE TABLE public.user_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL, action_type TEXT NOT NULL, content_id UUID,
  metadata JSONB DEFAULT '{}'::jsonb, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.user_activity ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own activity" ON public.user_activity FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert own activity" ON public.user_activity FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admins full access user_activity" ON public.user_activity FOR ALL TO authenticated USING (has_role('super_admin'::app_role)) WITH CHECK (has_role('super_admin'::app_role));
CREATE INDEX idx_user_activity_user_id ON public.user_activity(user_id);
CREATE INDEX idx_user_activity_created_at ON public.user_activity(created_at DESC);

-- 21. audit_log
CREATE TABLE public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL, action TEXT NOT NULL, table_name TEXT NOT NULL,
  record_id UUID, old_data JSONB DEFAULT '{}'::jsonb, new_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Super admins full access audit_log" ON public.audit_log FOR ALL TO authenticated USING (has_role('super_admin'::app_role)) WITH CHECK (has_role('super_admin'::app_role));
CREATE POLICY "Users can view own audit_log" ON public.audit_log FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert own audit_log" ON public.audit_log FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE INDEX idx_audit_log_user_id ON public.audit_log(user_id);
CREATE INDEX idx_audit_log_created_at ON public.audit_log(created_at DESC);
CREATE INDEX idx_audit_log_table_name ON public.audit_log(table_name);

-- 22. referral_codes
CREATE TABLE public.referral_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL, code TEXT NOT NULL UNIQUE,
  broker_id UUID REFERENCES public.brokers(id) ON DELETE SET NULL,
  clicks INTEGER NOT NULL DEFAULT 0, conversions INTEGER NOT NULL DEFAULT 0,
  earnings NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own referral_codes" ON public.referral_codes FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert own referral_codes" ON public.referral_codes FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own referral_codes" ON public.referral_codes FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins full access referral_codes" ON public.referral_codes FOR ALL TO authenticated USING (has_role('super_admin'::app_role)) WITH CHECK (has_role('super_admin'::app_role));
CREATE POLICY "Anon can read referral_codes by code" ON public.referral_codes FOR SELECT TO anon USING (true);
CREATE INDEX idx_referral_codes_user ON public.referral_codes(user_id);
CREATE INDEX idx_referral_codes_code ON public.referral_codes(code);
CREATE TRIGGER update_referral_codes_updated_at BEFORE UPDATE ON public.referral_codes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 23. referral_clicks
CREATE TABLE public.referral_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_code_id UUID NOT NULL REFERENCES public.referral_codes(id) ON DELETE CASCADE,
  ip_hash TEXT, user_agent TEXT, referrer_url TEXT, converted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.referral_clicks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view clicks on own codes" ON public.referral_clicks FOR SELECT TO authenticated
  USING (referral_code_id IN (SELECT id FROM public.referral_codes WHERE user_id = auth.uid()));
CREATE POLICY "Anon can insert referral_clicks" ON public.referral_clicks FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Auth can insert referral_clicks" ON public.referral_clicks FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admins full access referral_clicks" ON public.referral_clicks FOR ALL TO authenticated USING (has_role('super_admin'::app_role)) WITH CHECK (has_role('super_admin'::app_role));

-- 24. notifications
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL, type TEXT NOT NULL DEFAULT 'info',
  title TEXT NOT NULL, message TEXT DEFAULT '', link TEXT DEFAULT '',
  read BOOLEAN NOT NULL DEFAULT false, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins full access notifications" ON public.notifications FOR ALL TO authenticated USING (has_role('super_admin'::app_role)) WITH CHECK (has_role('super_admin'::app_role));
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_read ON public.notifications(user_id, read);

-- 25. Referral helper functions
CREATE OR REPLACE FUNCTION public.increment_referral_clicks(code_id UUID)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public
AS $$ UPDATE public.referral_codes SET clicks = clicks + 1 WHERE id = code_id; $$;

CREATE OR REPLACE FUNCTION public.convert_referral(code_text text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE ref_id uuid;
BEGIN
  SELECT id INTO ref_id FROM public.referral_codes WHERE code = code_text;
  IF ref_id IS NOT NULL THEN
    UPDATE public.referral_codes SET conversions = conversions + 1 WHERE id = ref_id;
  END IF;
  RETURN ref_id;
END;
$$;

-- 26. Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 27. Auto-generate username trigger
CREATE OR REPLACE FUNCTION public.generate_username()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  base_name TEXT; candidate TEXT; counter INT := 0;
BEGIN
  IF NEW.username IS NOT NULL THEN RETURN NEW; END IF;
  base_name := lower(regexp_replace(coalesce(NEW.full_name, 'user'), '[^a-zA-Z0-9]', '_', 'g'));
  base_name := substring(base_name from 1 for 17);
  IF length(base_name) < 3 THEN base_name := base_name || '_user'; END IF;
  candidate := base_name;
  LOOP
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.profiles WHERE username = candidate);
    counter := counter + 1;
    candidate := base_name || '_' || counter;
  END LOOP;
  NEW.username := candidate;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_generate_username BEFORE INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.generate_username();

-- =============================================
-- NEW PROFILE SYSTEM TABLES
-- =============================================

-- 28. broker_profiles
CREATE TABLE public.broker_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  broker_id UUID REFERENCES public.brokers(id) ON DELETE CASCADE NOT NULL UNIQUE,
  claimed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  tier TEXT NOT NULL DEFAULT 'basic' CHECK (tier IN ('basic', 'verified', 'featured')),
  claim_status TEXT NOT NULL DEFAULT 'unclaimed' CHECK (claim_status IN ('unclaimed', 'pending', 'claimed')),
  verification_docs_url TEXT, account_manager_name TEXT, account_manager_contact TEXT,
  is_verified BOOLEAN DEFAULT false, is_featured BOOLEAN DEFAULT false, featured_position INT,
  created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.broker_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view broker profiles" ON public.broker_profiles FOR SELECT USING (true);
CREATE POLICY "Super admin can manage broker profiles" ON public.broker_profiles FOR ALL USING (has_role('super_admin'::app_role));
CREATE TRIGGER update_broker_profiles_updated_at BEFORE UPDATE ON public.broker_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_broker_profiles_broker_id ON public.broker_profiles(broker_id);
CREATE INDEX idx_broker_profiles_claimed_by ON public.broker_profiles(claimed_by);

-- 29. signal_profiles
CREATE TABLE public.signal_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  signal_group_id UUID REFERENCES public.signal_groups(id) ON DELETE CASCADE NOT NULL UNIQUE,
  claimed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  tier TEXT NOT NULL DEFAULT 'basic' CHECK (tier IN ('basic', 'verified', 'featured')),
  claim_status TEXT NOT NULL DEFAULT 'unclaimed' CHECK (claim_status IN ('unclaimed', 'pending', 'claimed')),
  verification_docs_url TEXT, account_manager_name TEXT, account_manager_contact TEXT,
  is_verified BOOLEAN DEFAULT false, is_featured BOOLEAN DEFAULT false, featured_position INT,
  created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.signal_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view signal profiles" ON public.signal_profiles FOR SELECT USING (true);
CREATE POLICY "Super admin can manage signal profiles" ON public.signal_profiles FOR ALL USING (has_role('super_admin'::app_role));
CREATE TRIGGER update_signal_profiles_updated_at BEFORE UPDATE ON public.signal_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_signal_profiles_signal_group_id ON public.signal_profiles(signal_group_id);

-- 30. betting_profiles
CREATE TABLE public.betting_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_name TEXT NOT NULL, slug TEXT UNIQUE NOT NULL,
  claimed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  tier TEXT NOT NULL DEFAULT 'basic' CHECK (tier IN ('basic', 'verified', 'featured')),
  claim_status TEXT NOT NULL DEFAULT 'unclaimed' CHECK (claim_status IN ('unclaimed', 'pending', 'claimed')),
  supported_sports TEXT[], affiliate_url TEXT, verification_docs_url TEXT,
  account_manager_name TEXT, account_manager_contact TEXT,
  is_verified BOOLEAN DEFAULT false, is_featured BOOLEAN DEFAULT false, featured_position INT,
  created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.betting_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view betting profiles" ON public.betting_profiles FOR SELECT USING (true);
CREATE POLICY "Super admin can manage betting profiles" ON public.betting_profiles FOR ALL USING (has_role('super_admin'::app_role));
CREATE TRIGGER update_betting_profiles_updated_at BEFORE UPDATE ON public.betting_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_betting_profiles_slug ON public.betting_profiles(slug);

-- 31. profile_claims
CREATE TABLE public.profile_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_type TEXT NOT NULL CHECK (profile_type IN ('broker', 'signal', 'betting')),
  profile_id UUID NOT NULL,
  claimed_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  documents_url TEXT, status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_note TEXT, reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(), reviewed_at TIMESTAMPTZ
);
ALTER TABLE public.profile_claims ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can create own claims" ON public.profile_claims FOR INSERT WITH CHECK (auth.uid() = claimed_by);
CREATE POLICY "Users can view own claims" ON public.profile_claims FOR SELECT USING (auth.uid() = claimed_by);
CREATE POLICY "Super admin can manage claims" ON public.profile_claims FOR ALL USING (has_role('super_admin'::app_role));
CREATE INDEX idx_profile_claims_status ON public.profile_claims(status);

-- 32. tier_upgrades
CREATE TABLE public.tier_upgrades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_type TEXT NOT NULL CHECK (profile_type IN ('broker', 'signal', 'betting')),
  profile_id UUID NOT NULL,
  requested_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  current_tier TEXT NOT NULL, requested_tier TEXT NOT NULL, contact_info JSONB,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_discussion', 'approved', 'rejected')),
  admin_note TEXT,
  created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.tier_upgrades ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can create own upgrade requests" ON public.tier_upgrades FOR INSERT WITH CHECK (auth.uid() = requested_by);
CREATE POLICY "Users can view own upgrade requests" ON public.tier_upgrades FOR SELECT USING (auth.uid() = requested_by);
CREATE POLICY "Super admin can manage tier upgrades" ON public.tier_upgrades FOR ALL USING (has_role('super_admin'::app_role));
CREATE TRIGGER update_tier_upgrades_updated_at BEFORE UPDATE ON public.tier_upgrades FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_tier_upgrades_status ON public.tier_upgrades(status);

-- 33. reputation_events
CREATE TABLE public.reputation_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  event_type TEXT NOT NULL, points_delta INT NOT NULL,
  reference_type TEXT, reference_id UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.reputation_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own reputation events" ON public.reputation_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Super admin can manage reputation events" ON public.reputation_events FOR ALL USING (has_role('super_admin'::app_role));
CREATE INDEX idx_reputation_events_user_id ON public.reputation_events(user_id);

-- 34. Reputation recalculation trigger
CREATE OR REPLACE FUNCTION public.recalculate_reputation()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE total_score INT; tier_label TEXT;
BEGIN
  SELECT COALESCE(SUM(points_delta), 0) INTO total_score FROM public.reputation_events WHERE user_id = NEW.user_id;
  IF total_score < 0 THEN total_score := 0; END IF;
  IF total_score > 100 THEN total_score := 100; END IF;
  IF total_score <= 20 THEN tier_label := 'New Trader';
  ELSIF total_score <= 40 THEN tier_label := 'Active Trader';
  ELSIF total_score <= 60 THEN tier_label := 'Trusted Trader';
  ELSIF total_score <= 80 THEN tier_label := 'Verified Voice';
  ELSE tier_label := 'Top Contributor';
  END IF;
  UPDATE public.profiles SET reputation_score = total_score, reputation_tier = tier_label WHERE user_id = NEW.user_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_recalculate_reputation AFTER INSERT ON public.reputation_events
  FOR EACH ROW EXECUTE FUNCTION public.recalculate_reputation();

-- 35. Additional indexes
CREATE INDEX idx_profiles_username ON public.profiles(username);
CREATE INDEX idx_approval_queue_priority ON public.approval_queue(priority);
