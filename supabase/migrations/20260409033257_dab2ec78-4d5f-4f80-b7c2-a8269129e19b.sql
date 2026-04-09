-- Step 1: Drop ALL policies that depend on has_role(uuid, app_role)
DROP POLICY IF EXISTS "Admins full access applications" ON public.applications;
DROP POLICY IF EXISTS "Admins full access approval_queue" ON public.approval_queue;
DROP POLICY IF EXISTS "Admins full access brokers" ON public.brokers;
DROP POLICY IF EXISTS "Admins full access complaints" ON public.complaints;
DROP POLICY IF EXISTS "Admins full access forecasts" ON public.forecasts;
DROP POLICY IF EXISTS "Admins full access profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins full access reviews" ON public.reviews;
DROP POLICY IF EXISTS "Admins full access scam_alerts" ON public.scam_alerts;
DROP POLICY IF EXISTS "Admins full access signals" ON public.signal_groups;
DROP POLICY IF EXISTS "Admins can manage site_settings" ON public.site_settings;
DROP POLICY IF EXISTS "Super admins can manage all roles" ON public.user_roles;

-- Step 2: Fix profiles PII exposure
DROP POLICY IF EXISTS "Public can view profiles" ON public.profiles;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Step 3: Drop old has_role function and create new one
DROP FUNCTION IF EXISTS public.has_role(uuid, app_role);

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

-- Step 4: Recreate all admin policies with new has_role() signature
CREATE POLICY "Admins full access applications"
  ON public.applications FOR ALL TO authenticated
  USING (has_role('super_admin'::app_role))
  WITH CHECK (has_role('super_admin'::app_role));

CREATE POLICY "Admins full access approval_queue"
  ON public.approval_queue FOR ALL TO authenticated
  USING (has_role('super_admin'::app_role))
  WITH CHECK (has_role('super_admin'::app_role));

CREATE POLICY "Admins full access brokers"
  ON public.brokers FOR ALL TO authenticated
  USING (has_role('super_admin'::app_role))
  WITH CHECK (has_role('super_admin'::app_role));

CREATE POLICY "Admins full access complaints"
  ON public.complaints FOR ALL TO authenticated
  USING (has_role('super_admin'::app_role))
  WITH CHECK (has_role('super_admin'::app_role));

CREATE POLICY "Admins full access forecasts"
  ON public.forecasts FOR ALL TO authenticated
  USING (has_role('super_admin'::app_role))
  WITH CHECK (has_role('super_admin'::app_role));

CREATE POLICY "Admins full access profiles"
  ON public.profiles FOR ALL TO authenticated
  USING (has_role('super_admin'::app_role))
  WITH CHECK (has_role('super_admin'::app_role));

CREATE POLICY "Admins full access reviews"
  ON public.reviews FOR ALL TO authenticated
  USING (has_role('super_admin'::app_role))
  WITH CHECK (has_role('super_admin'::app_role));

CREATE POLICY "Admins full access scam_alerts"
  ON public.scam_alerts FOR ALL TO authenticated
  USING (has_role('super_admin'::app_role))
  WITH CHECK (has_role('super_admin'::app_role));

CREATE POLICY "Admins full access signals"
  ON public.signal_groups FOR ALL TO authenticated
  USING (has_role('super_admin'::app_role))
  WITH CHECK (has_role('super_admin'::app_role));

CREATE POLICY "Admins can manage site_settings"
  ON public.site_settings FOR ALL TO authenticated
  USING (has_role('super_admin'::app_role))
  WITH CHECK (has_role('super_admin'::app_role));

CREATE POLICY "Super admins can manage all roles"
  ON public.user_roles FOR ALL TO authenticated
  USING (has_role('super_admin'::app_role))
  WITH CHECK (has_role('super_admin'::app_role));