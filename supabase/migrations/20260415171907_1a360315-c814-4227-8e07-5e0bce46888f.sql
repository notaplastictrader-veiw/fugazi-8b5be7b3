
-- Brokers: creator can view & update own
CREATE POLICY "Creators can view own brokers"
ON public.brokers FOR SELECT TO authenticated
USING (created_by = auth.uid());

CREATE POLICY "Creators can update own brokers"
ON public.brokers FOR UPDATE TO authenticated
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

-- Signal groups: creator can view & update own
CREATE POLICY "Creators can view own signal_groups"
ON public.signal_groups FOR SELECT TO authenticated
USING (created_by = auth.uid());

CREATE POLICY "Creators can update own signal_groups"
ON public.signal_groups FOR UPDATE TO authenticated
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

-- Betting profiles: claimed_by can view & update own
CREATE POLICY "Creators can view own betting_profiles"
ON public.betting_profiles FOR SELECT TO authenticated
USING (claimed_by = auth.uid());

CREATE POLICY "Creators can update own betting_profiles"
ON public.betting_profiles FOR UPDATE TO authenticated
USING (claimed_by = auth.uid())
WITH CHECK (claimed_by = auth.uid());

-- Add contact_info column to profile_claims
ALTER TABLE public.profile_claims
ADD COLUMN IF NOT EXISTS contact_info jsonb DEFAULT '{}'::jsonb;
