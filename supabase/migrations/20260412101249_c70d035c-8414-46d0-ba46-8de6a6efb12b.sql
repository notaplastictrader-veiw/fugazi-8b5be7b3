
-- Create watchlist table
CREATE TABLE public.watchlist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  broker_id UUID NOT NULL REFERENCES public.brokers(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, broker_id)
);

ALTER TABLE public.watchlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own watchlist"
ON public.watchlist FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can add to own watchlist"
ON public.watchlist FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can remove from own watchlist"
ON public.watchlist FOR DELETE
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins full access watchlist"
ON public.watchlist FOR ALL
TO authenticated
USING (has_role('super_admin'::app_role))
WITH CHECK (has_role('super_admin'::app_role));

-- Create user_activity table
CREATE TABLE public.user_activity (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  action_type TEXT NOT NULL,
  content_id UUID,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.user_activity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own activity"
ON public.user_activity FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can insert own activity"
ON public.user_activity FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins full access user_activity"
ON public.user_activity FOR ALL
TO authenticated
USING (has_role('super_admin'::app_role))
WITH CHECK (has_role('super_admin'::app_role));

-- Add indexes
CREATE INDEX idx_watchlist_user_id ON public.watchlist(user_id);
CREATE INDEX idx_watchlist_broker_id ON public.watchlist(broker_id);
CREATE INDEX idx_user_activity_user_id ON public.user_activity(user_id);
CREATE INDEX idx_user_activity_created_at ON public.user_activity(created_at DESC);
