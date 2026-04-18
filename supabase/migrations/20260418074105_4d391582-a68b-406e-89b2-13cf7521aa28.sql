-- Create review_replies table for broker owners to respond to reviews
CREATE TABLE public.review_replies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  review_id UUID NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  broker_id UUID NOT NULL REFERENCES public.brokers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (review_id)
);

CREATE INDEX idx_review_replies_review ON public.review_replies(review_id);
CREATE INDEX idx_review_replies_broker ON public.review_replies(broker_id);

ALTER TABLE public.review_replies ENABLE ROW LEVEL SECURITY;

-- Anyone can read replies (they appear under public reviews)
CREATE POLICY "Public can view review replies"
ON public.review_replies
FOR SELECT
USING (true);

-- Super admins full access
CREATE POLICY "Admins full access review_replies"
ON public.review_replies
FOR ALL
TO authenticated
USING (has_role('super_admin'::app_role))
WITH CHECK (has_role('super_admin'::app_role));

-- Claimed broker owner can insert a reply for their broker
CREATE POLICY "Broker owner can insert reply"
ON public.review_replies
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.broker_profiles bp
    WHERE bp.broker_id = review_replies.broker_id
      AND bp.claimed_by = auth.uid()
      AND bp.claim_status = 'approved'
  )
);

-- Claimed broker owner can update own reply
CREATE POLICY "Broker owner can update own reply"
ON public.review_replies
FOR UPDATE
TO authenticated
USING (
  user_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.broker_profiles bp
    WHERE bp.broker_id = review_replies.broker_id
      AND bp.claimed_by = auth.uid()
      AND bp.claim_status = 'approved'
  )
);

-- Claimed broker owner can delete own reply
CREATE POLICY "Broker owner can delete own reply"
ON public.review_replies
FOR DELETE
TO authenticated
USING (
  user_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.broker_profiles bp
    WHERE bp.broker_id = review_replies.broker_id
      AND bp.claimed_by = auth.uid()
  )
);

-- Auto-update updated_at
CREATE TRIGGER update_review_replies_updated_at
BEFORE UPDATE ON public.review_replies
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();