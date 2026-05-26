CREATE OR REPLACE FUNCTION public.sync_broker_avg_rating()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  affected_broker uuid;
  v_avg numeric;
  v_count int;
BEGIN
  IF (TG_OP = 'DELETE') THEN
    affected_broker := OLD.broker_id;
  ELSE
    affected_broker := NEW.broker_id;
  END IF;

  IF affected_broker IS NOT NULL THEN
    SELECT ROUND(AVG(r.rating)::numeric, 2), COUNT(*)
      INTO v_avg, v_count
      FROM public.reviews r
      WHERE r.broker_id = affected_broker
        AND r.status = 'published'
        AND r.rating IS NOT NULL
        AND COALESCE(r.role, '') NOT IN ('editor','editorial');

    -- Only update stars if at least one community review exists; otherwise leave imported stars alone
    IF v_count > 0 THEN
      UPDATE public.brokers b
         SET stars = COALESCE(v_avg, 0),
             review_count = v_count
       WHERE b.id = affected_broker;
    ELSE
      UPDATE public.brokers b
         SET review_count = 0
       WHERE b.id = affected_broker;
    END IF;
  END IF;

  IF (TG_OP = 'UPDATE'
      AND OLD.broker_id IS DISTINCT FROM NEW.broker_id
      AND OLD.broker_id IS NOT NULL) THEN
    SELECT ROUND(AVG(r.rating)::numeric, 2), COUNT(*)
      INTO v_avg, v_count
      FROM public.reviews r
      WHERE r.broker_id = OLD.broker_id
        AND r.status = 'published'
        AND r.rating IS NOT NULL
        AND COALESCE(r.role, '') NOT IN ('editor','editorial');

    IF v_count > 0 THEN
      UPDATE public.brokers b
         SET stars = COALESCE(v_avg, 0),
             review_count = v_count
       WHERE b.id = OLD.broker_id;
    ELSE
      UPDATE public.brokers b
         SET review_count = 0
       WHERE b.id = OLD.broker_id;
    END IF;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$function$;

-- Also patch sync_broker_review_count for consistency (exclude editorial from review_count)
CREATE OR REPLACE FUNCTION public.sync_broker_review_count()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
         WHERE broker_id = affected_broker
           AND status = 'published'
           AND COALESCE(role, '') NOT IN ('editor','editorial')
       )
     WHERE id = affected_broker;
  END IF;

  IF (TG_OP = 'UPDATE' AND OLD.broker_id IS DISTINCT FROM NEW.broker_id AND OLD.broker_id IS NOT NULL) THEN
    UPDATE public.brokers
       SET review_count = (
         SELECT COUNT(*) FROM public.reviews
         WHERE broker_id = OLD.broker_id
           AND status = 'published'
           AND COALESCE(role, '') NOT IN ('editor','editorial')
       )
     WHERE id = OLD.broker_id;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$function$;