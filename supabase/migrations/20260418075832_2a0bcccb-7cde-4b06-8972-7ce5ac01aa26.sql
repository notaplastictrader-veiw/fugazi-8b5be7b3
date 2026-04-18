-- Create review_reactions table for emoji reactions on reviews
CREATE TABLE public.review_reactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  review_id UUID NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  reaction TEXT NOT NULL CHECK (reaction IN ('love', 'care', 'helpful', 'thanks')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (review_id, user_id, reaction)
);

CREATE INDEX idx_review_reactions_review ON public.review_reactions(review_id);
CREATE INDEX idx_review_reactions_user ON public.review_reactions(user_id);

ALTER TABLE public.review_reactions ENABLE ROW LEVEL SECURITY;

-- Anyone can view reactions (counts shown publicly)
CREATE POLICY "Public can view review reactions"
ON public.review_reactions
FOR SELECT
USING (true);

-- Authenticated users can add their own reactions
CREATE POLICY "Users can insert own reactions"
ON public.review_reactions
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Authenticated users can delete their own reactions
CREATE POLICY "Users can delete own reactions"
ON public.review_reactions
FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- Super admins have full access
CREATE POLICY "Admins full access review_reactions"
ON public.review_reactions
FOR ALL
TO authenticated
USING (has_role('super_admin'::app_role))
WITH CHECK (has_role('super_admin'::app_role));

-- Trigger to keep brokers.review_count synced with published reviews
CREATE OR REPLACE FUNCTION public.sync_broker_review_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  affected_broker UUID;
BEGIN
  IF (TG_OP = 'DELETE') THEN
    affected_broker := OLD.broker_id;
  ELSE
    affected_broker := NEW.broker_id;
  END IF;

  IF affected_broker IS NOT NULL THEN
    UPDATE public.brokers
       SET review_count = (
         SELECT COUNT(*) FROM public.reviews
         WHERE broker_id = affected_broker AND status = 'published'
       )
     WHERE id = affected_broker;
  END IF;

  -- Also update old broker if broker_id changed on UPDATE
  IF (TG_OP = 'UPDATE' AND OLD.broker_id IS DISTINCT FROM NEW.broker_id AND OLD.broker_id IS NOT NULL) THEN
    UPDATE public.brokers
       SET review_count = (
         SELECT COUNT(*) FROM public.reviews
         WHERE broker_id = OLD.broker_id AND status = 'published'
       )
     WHERE id = OLD.broker_id;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER trg_sync_broker_review_count
AFTER INSERT OR UPDATE OR DELETE ON public.reviews
FOR EACH ROW
EXECUTE FUNCTION public.sync_broker_review_count();

-- Backfill existing review counts
UPDATE public.brokers b
SET review_count = (
  SELECT COUNT(*) FROM public.reviews r
  WHERE r.broker_id = b.id AND r.status = 'published'
);