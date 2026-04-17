-- Phase 1: Education Articles + Courses tables
CREATE TABLE public.courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  type text NOT NULL DEFAULT 'course',
  price numeric NOT NULL DEFAULT 0,
  original_price numeric,
  description text DEFAULT '',
  includes text[] DEFAULT '{}',
  note text DEFAULT '',
  is_active boolean DEFAULT true,
  is_featured boolean DEFAULT false,
  display_order integer DEFAULT 0,
  status content_status NOT NULL DEFAULT 'published',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.education_articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  track text NOT NULL DEFAULT 'beginner',
  read_time integer DEFAULT 5,
  is_locked boolean DEFAULT false,
  course_id uuid REFERENCES public.courses(id) ON DELETE SET NULL,
  sections jsonb NOT NULL DEFAULT '[]'::jsonb,
  key_takeaway text DEFAULT '',
  display_order integer DEFAULT 0,
  status content_status NOT NULL DEFAULT 'published',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.education_articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view published courses" ON public.courses
  FOR SELECT TO anon, authenticated USING (status = 'published');
CREATE POLICY "Admins full access courses" ON public.courses
  FOR ALL TO authenticated USING (has_role('super_admin')) WITH CHECK (has_role('super_admin'));

CREATE POLICY "Public can view published education_articles" ON public.education_articles
  FOR SELECT TO anon, authenticated USING (status = 'published');
CREATE POLICY "Admins full access education_articles" ON public.education_articles
  FOR ALL TO authenticated USING (has_role('super_admin')) WITH CHECK (has_role('super_admin'));

CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON public.courses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_education_articles_updated_at BEFORE UPDATE ON public.education_articles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Phase 2: Betting Sites table
CREATE TABLE public.betting_sites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  logo text DEFAULT '',
  rating numeric DEFAULT 0,
  bonus text DEFAULT '',
  sports text[] DEFAULT '{}',
  features text[] DEFAULT '{}',
  min_deposit text DEFAULT '$10',
  withdrawal_speed text DEFAULT '',
  license text DEFAULT '',
  url text DEFAULT '',
  warning text DEFAULT '',
  display_order integer DEFAULT 0,
  status content_status NOT NULL DEFAULT 'published',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.betting_sites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view published betting_sites" ON public.betting_sites
  FOR SELECT TO anon, authenticated USING (status = 'published');
CREATE POLICY "Admins full access betting_sites" ON public.betting_sites
  FOR ALL TO authenticated USING (has_role('super_admin')) WITH CHECK (has_role('super_admin'));

CREATE TRIGGER update_betting_sites_updated_at BEFORE UPDATE ON public.betting_sites
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Phase 3: Add columns to brokers
ALTER TABLE public.brokers
  ADD COLUMN description text DEFAULT '',
  ADD COLUMN founded_year integer,
  ADD COLUMN headquarters text DEFAULT '',
  ADD COLUMN pros text[] DEFAULT '{}',
  ADD COLUMN cons text[] DEFAULT '{}',
  ADD COLUMN payment_methods text[] DEFAULT '{}',
  ADD COLUMN platforms text[] DEFAULT '{}',
  ADD COLUMN account_types jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN website_url text DEFAULT '',
  ADD COLUMN support_email text DEFAULT '',
  ADD COLUMN support_phone text DEFAULT '';

-- Phase 4: Add columns to signal_groups
ALTER TABLE public.signal_groups
  ADD COLUMN description text DEFAULT '',
  ADD COLUMN telegram_url text DEFAULT '',
  ADD COLUMN discord_url text DEFAULT '',
  ADD COLUMN pricing_tiers jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN sample_signals jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN categories text[] DEFAULT '{}';