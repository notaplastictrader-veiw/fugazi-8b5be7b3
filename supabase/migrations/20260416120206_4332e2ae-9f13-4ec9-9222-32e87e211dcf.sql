-- Users can insert their own scam reports
CREATE POLICY "Users can insert own scam_alerts"
ON public.scam_alerts FOR INSERT TO authenticated
WITH CHECK (created_by = auth.uid());

-- Users can view own pending scam_alerts
CREATE POLICY "Users can view own scam_alerts"
ON public.scam_alerts FOR SELECT TO authenticated
USING (created_by = auth.uid());