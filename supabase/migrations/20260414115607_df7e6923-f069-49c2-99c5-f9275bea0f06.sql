
-- Fix overly permissive anon INSERT on referral_clicks
DROP POLICY IF EXISTS "Anon can insert referral_clicks" ON public.referral_clicks;
CREATE POLICY "Anon can insert referral_clicks" ON public.referral_clicks FOR INSERT TO anon
  WITH CHECK (referral_code_id IN (SELECT id FROM public.referral_codes));

DROP POLICY IF EXISTS "Auth can insert referral_clicks" ON public.referral_clicks;
CREATE POLICY "Auth can insert referral_clicks" ON public.referral_clicks FOR INSERT TO authenticated
  WITH CHECK (referral_code_id IN (SELECT id FROM public.referral_codes));
