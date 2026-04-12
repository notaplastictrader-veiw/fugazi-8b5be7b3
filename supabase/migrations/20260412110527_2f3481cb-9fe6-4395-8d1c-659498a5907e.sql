
-- Referral codes table
CREATE TABLE public.referral_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  code TEXT NOT NULL UNIQUE,
  broker_id UUID REFERENCES public.brokers(id) ON DELETE SET NULL,
  clicks INTEGER NOT NULL DEFAULT 0,
  conversions INTEGER NOT NULL DEFAULT 0,
  earnings NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own referral_codes"
  ON public.referral_codes FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own referral_codes"
  ON public.referral_codes FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own referral_codes"
  ON public.referral_codes FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins full access referral_codes"
  ON public.referral_codes FOR ALL TO authenticated
  USING (has_role('super_admin'::app_role))
  WITH CHECK (has_role('super_admin'::app_role));

-- Allow anon to read referral codes for click tracking
CREATE POLICY "Anon can read referral_codes by code"
  ON public.referral_codes FOR SELECT TO anon
  USING (true);

CREATE INDEX idx_referral_codes_user ON public.referral_codes(user_id);
CREATE INDEX idx_referral_codes_code ON public.referral_codes(code);

-- Referral clicks table
CREATE TABLE public.referral_clicks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referral_code_id UUID NOT NULL REFERENCES public.referral_codes(id) ON DELETE CASCADE,
  ip_hash TEXT,
  user_agent TEXT,
  referrer_url TEXT,
  converted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.referral_clicks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view clicks on own codes"
  ON public.referral_clicks FOR SELECT TO authenticated
  USING (
    referral_code_id IN (
      SELECT id FROM public.referral_codes WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Anon can insert referral_clicks"
  ON public.referral_clicks FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "Auth can insert referral_clicks"
  ON public.referral_clicks FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins full access referral_clicks"
  ON public.referral_clicks FOR ALL TO authenticated
  USING (has_role('super_admin'::app_role))
  WITH CHECK (has_role('super_admin'::app_role));

CREATE INDEX idx_referral_clicks_code ON public.referral_clicks(referral_code_id);
CREATE INDEX idx_referral_clicks_created ON public.referral_clicks(created_at DESC);

-- Add trigger for updated_at on referral_codes
CREATE TRIGGER update_referral_codes_updated_at
  BEFORE UPDATE ON public.referral_codes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
