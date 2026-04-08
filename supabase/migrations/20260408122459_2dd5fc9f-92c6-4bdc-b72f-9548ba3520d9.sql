
-- 1. Create app_role enum
CREATE TYPE public.app_role AS ENUM ('super_admin', 'content_ops', 'moderator', 'user', 'broker', 'signal_provider');

-- 2. Create content_status enum
CREATE TYPE public.content_status AS ENUM ('draft', 'pending', 'published', 'rejected');

-- 3. user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- 4. has_role() security definer function
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- 5. RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can manage all roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- 6. brokers table
CREATE TABLE public.brokers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL DEFAULT 'forex',
  tags TEXT[] DEFAULT '{}',
  regulation TEXT[] DEFAULT '{}',
  score NUMERIC(3,1) DEFAULT 0,
  avg_spread TEXT DEFAULT '0',
  leverage TEXT DEFAULT '1:100',
  min_deposit TEXT DEFAULT '$0',
  stars NUMERIC(2,1) DEFAULT 0,
  review_count INT DEFAULT 0,
  complaints INT DEFAULT 0,
  badge TEXT DEFAULT 'none',
  logo_url TEXT,
  status content_status NOT NULL DEFAULT 'draft',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE POLICY "Public can view published brokers"
  ON public.brokers FOR SELECT TO anon, authenticated
  USING (status = 'published');

CREATE POLICY "Admins full access brokers"
  ON public.brokers FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- 7. signal_groups table
CREATE TABLE public.signal_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  win_rate INT DEFAULT 0,
  monthly_signals TEXT DEFAULT '0',
  avg_rr TEXT DEFAULT '1:1',
  track_record TEXT DEFAULT '',
  members TEXT DEFAULT '0',
  verified BOOLEAN DEFAULT false,
  status content_status NOT NULL DEFAULT 'draft',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE POLICY "Public can view published signals"
  ON public.signal_groups FOR SELECT TO anon, authenticated
  USING (status = 'published');

CREATE POLICY "Admins full access signals"
  ON public.signal_groups FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- 8. forecasts table
CREATE TABLE public.forecasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pair TEXT NOT NULL,
  direction TEXT NOT NULL DEFAULT 'bullish',
  potential TEXT NOT NULL DEFAULT 'MED',
  reasoning TEXT DEFAULT '',
  updated_label TEXT DEFAULT '',
  category TEXT NOT NULL DEFAULT 'forex',
  status content_status NOT NULL DEFAULT 'draft',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE POLICY "Public can view published forecasts"
  ON public.forecasts FOR SELECT TO anon, authenticated
  USING (status = 'published');

CREATE POLICY "Admins full access forecasts"
  ON public.forecasts FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- 9. reviews table
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  broker_id UUID REFERENCES public.brokers(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  rating INT DEFAULT 5,
  author TEXT DEFAULT 'Anonymous',
  content TEXT DEFAULT '',
  avatar TEXT DEFAULT '',
  role TEXT DEFAULT 'Trader',
  status content_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE POLICY "Public can view published reviews"
  ON public.reviews FOR SELECT TO anon, authenticated
  USING (status = 'published');

CREATE POLICY "Users can insert own reviews"
  ON public.reviews FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins full access reviews"
  ON public.reviews FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- 10. complaints table
CREATE TABLE public.complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  broker_id UUID REFERENCES public.brokers(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  content TEXT DEFAULT '',
  proof_urls TEXT[] DEFAULT '{}',
  status content_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE POLICY "Public can view published complaints"
  ON public.complaints FOR SELECT TO anon, authenticated
  USING (status = 'published');

CREATE POLICY "Users can insert own complaints"
  ON public.complaints FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins full access complaints"
  ON public.complaints FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- 11. scam_alerts table
CREATE TABLE public.scam_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  broker_id UUID REFERENCES public.brokers(id) ON DELETE SET NULL,
  severity TEXT NOT NULL DEFAULT 'medium',
  title TEXT NOT NULL DEFAULT '',
  description TEXT DEFAULT '',
  status content_status NOT NULL DEFAULT 'draft',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE POLICY "Public can view published scam_alerts"
  ON public.scam_alerts FOR SELECT TO anon, authenticated
  USING (status = 'published');

CREATE POLICY "Admins full access scam_alerts"
  ON public.scam_alerts FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- 12. site_settings table
CREATE TABLE public.site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

CREATE POLICY "Public can read site_settings"
  ON public.site_settings FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can manage site_settings"
  ON public.site_settings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- 13. approval_queue table
CREATE TABLE public.approval_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type TEXT NOT NULL,
  content_id UUID NOT NULL,
  submitted_by UUID REFERENCES auth.users(id),
  status TEXT NOT NULL DEFAULT 'pending',
  reviewer_notes TEXT DEFAULT '',
  reviewed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ
);

CREATE POLICY "Admins full access approval_queue"
  ON public.approval_queue FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Users can view own submissions"
  ON public.approval_queue FOR SELECT TO authenticated
  USING (submitted_by = auth.uid());
