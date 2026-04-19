CREATE OR REPLACE FUNCTION public.detect_potential_scam(_broker_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  complaint_count int;
  low_review_count int;
  total_reviews int;
  avg_rating numeric;
  broker_name_val text;
  triggered boolean := false;
  trigger_reason text := '';
  new_alert_id uuid;
  existing_alert_id uuid;
BEGIN
  IF _broker_id IS NULL THEN RETURN; END IF;

  -- Skip if ANY auto-alert (regardless of status) exists for this broker in last 30 days
  SELECT sa.id INTO existing_alert_id
  FROM public.scam_alerts sa
  WHERE sa.broker_id = _broker_id
    AND sa.created_at > now() - interval '30 days'
    AND sa.title LIKE 'Auto-detected:%'
  LIMIT 1;

  IF existing_alert_id IS NOT NULL THEN RETURN; END IF;

  -- Gather metrics
  SELECT COUNT(*) INTO complaint_count
  FROM public.complaints
  WHERE broker_id = _broker_id AND status = 'published';

  SELECT COUNT(*), COUNT(*) FILTER (WHERE rating <= 2), COALESCE(AVG(rating), 0)
  INTO total_reviews, low_review_count, avg_rating
  FROM public.reviews
  WHERE broker_id = _broker_id AND status = 'published' AND rating IS NOT NULL;

  -- Evaluate triggers
  IF complaint_count >= 3 THEN
    triggered := true;
    trigger_reason := complaint_count || ' published complaints';
  END IF;

  IF low_review_count >= 5 THEN
    triggered := true;
    trigger_reason := CASE WHEN trigger_reason = '' THEN '' ELSE trigger_reason || ', ' END
                      || low_review_count || ' low-rating reviews (≤2★)';
  END IF;

  IF total_reviews >= 5 AND avg_rating < 2.0 THEN
    triggered := true;
    trigger_reason := CASE WHEN trigger_reason = '' THEN '' ELSE trigger_reason || ', ' END
                      || 'avg rating ' || ROUND(avg_rating, 1);
  END IF;

  IF NOT triggered THEN RETURN; END IF;

  -- Get broker name
  SELECT name INTO broker_name_val FROM public.brokers WHERE id = _broker_id;
  IF broker_name_val IS NULL THEN RETURN; END IF;

  -- Insert draft scam alert
  INSERT INTO public.scam_alerts (
    broker_id, title, description, severity, status, is_repeat_offender, show_full_report, created_by
  )
  VALUES (
    _broker_id,
    'Auto-detected: ' || broker_name_val,
    'System flagged this broker based on community signals: ' || trigger_reason || '. Please double-check before publishing.',
    'high',
    'draft',
    (complaint_count >= 5 OR low_review_count >= 8),
    false,
    NULL
  )
  RETURNING id INTO new_alert_id;

  -- Insert into approval queue
  INSERT INTO public.approval_queue (
    content_type, content_id, status, priority, reviewer_notes, submitted_by
  )
  VALUES (
    'scam_alert_auto', new_alert_id, 'pending', 1,
    'Auto-detected — needs admin verification. Trigger: ' || trigger_reason,
    NULL
  );

  -- Notify all super_admins
  INSERT INTO public.notifications (user_id, type, title, message, link)
  SELECT ur.user_id,
    'admin',
    '🚨 Auto-detected scam: ' || broker_name_val,
    'Trigger: ' || trigger_reason || '. Review and approve/reject in the queue.',
    '/admin/approvals'
  FROM public.user_roles ur
  WHERE ur.role = 'super_admin';
END;
$function$;