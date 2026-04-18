-- 1. Add photo_urls column to reviews
ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS photo_urls text[] NOT NULL DEFAULT '{}';

-- 2. Drop legacy reaction check constraint (allow any emoji)
ALTER TABLE public.review_reactions
  DROP CONSTRAINT IF EXISTS review_reactions_reaction_check;

-- 3. Function to sync broker avg rating + count from published reviews
CREATE OR REPLACE FUNCTION public.sync_broker_avg_rating()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  affected_broker uuid;
BEGIN
  IF (TG_OP = 'DELETE') THEN
    affected_broker := OLD.broker_id;
  ELSE
    affected_broker := NEW.broker_id;
  END IF;

  IF affected_broker IS NOT NULL THEN
    UPDATE public.brokers b
       SET stars = COALESCE((
             SELECT ROUND(AVG(r.rating)::numeric, 2)
             FROM public.reviews r
             WHERE r.broker_id = affected_broker
               AND r.status = 'published'
               AND r.rating IS NOT NULL
           ), 0),
           review_count = (
             SELECT COUNT(*) FROM public.reviews r
             WHERE r.broker_id = affected_broker
               AND r.status = 'published'
           )
     WHERE b.id = affected_broker;
  END IF;

  IF (TG_OP = 'UPDATE'
      AND OLD.broker_id IS DISTINCT FROM NEW.broker_id
      AND OLD.broker_id IS NOT NULL) THEN
    UPDATE public.brokers b
       SET stars = COALESCE((
             SELECT ROUND(AVG(r.rating)::numeric, 2)
             FROM public.reviews r
             WHERE r.broker_id = OLD.broker_id
               AND r.status = 'published'
               AND r.rating IS NOT NULL
           ), 0),
           review_count = (
             SELECT COUNT(*) FROM public.reviews r
             WHERE r.broker_id = OLD.broker_id
               AND r.status = 'published'
           )
     WHERE b.id = OLD.broker_id;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

-- 4. Trigger
DROP TRIGGER IF EXISTS trg_sync_broker_avg_rating ON public.reviews;
CREATE TRIGGER trg_sync_broker_avg_rating
AFTER INSERT OR UPDATE OR DELETE ON public.reviews
FOR EACH ROW EXECUTE FUNCTION public.sync_broker_avg_rating();

-- 5. Backfill existing broker averages
UPDATE public.brokers b
SET stars = COALESCE(sub.avg_rating, 0),
    review_count = COALESCE(sub.cnt, 0)
FROM (
  SELECT broker_id,
         ROUND(AVG(rating)::numeric, 2) AS avg_rating,
         COUNT(*) AS cnt
  FROM public.reviews
  WHERE status = 'published' AND broker_id IS NOT NULL
  GROUP BY broker_id
) sub
WHERE b.id = sub.broker_id;