-- review_reads: track which reviews a broker owner has read
CREATE TABLE public.review_reads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  review_id UUID NOT NULL,
  broker_id UUID NOT NULL,
  user_id UUID NOT NULL,
  read_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (review_id, user_id)
);

CREATE INDEX idx_review_reads_broker ON public.review_reads(broker_id);
CREATE INDEX idx_review_reads_user ON public.review_reads(user_id);

ALTER TABLE public.review_reads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins full access review_reads"
  ON public.review_reads
  FOR ALL TO authenticated
  USING (has_role('super_admin'::app_role))
  WITH CHECK (has_role('super_admin'::app_role));

CREATE POLICY "Broker owner can view own reads"
  ON public.review_reads
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.broker_profiles bp
      WHERE bp.broker_id = review_reads.broker_id
        AND bp.claimed_by = auth.uid()
    )
  );

CREATE POLICY "Broker owner can insert own reads"
  ON public.review_reads
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.broker_profiles bp
      WHERE bp.broker_id = review_reads.broker_id
        AND bp.claimed_by = auth.uid()
        AND bp.claim_status = 'approved'
    )
  );

-- Auto-set show_on_homepage when broker_profiles.tier becomes 'featured'
CREATE OR REPLACE FUNCTION public.sync_broker_homepage_on_featured()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.tier = 'featured' AND (OLD.tier IS DISTINCT FROM 'featured') THEN
    UPDATE public.brokers SET show_on_homepage = true WHERE id = NEW.broker_id;
  ELSIF OLD.tier = 'featured' AND NEW.tier <> 'featured' THEN
    UPDATE public.brokers SET show_on_homepage = false WHERE id = NEW.broker_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS broker_profiles_sync_homepage ON public.broker_profiles;
CREATE TRIGGER broker_profiles_sync_homepage
  AFTER UPDATE OF tier ON public.broker_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_broker_homepage_on_featured();