
-- ============ NAFT Pro subscription scaffolding (no payment yet) ============
CREATE TABLE IF NOT EXISTS public.pro_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'inactive', -- inactive | trial | active | cancelled
  plan text NOT NULL DEFAULT 'monthly',    -- monthly | annual | lifetime
  started_at timestamptz,
  expires_at timestamptz,
  source text DEFAULT 'manual',            -- manual | stripe | gift
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.pro_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own pro subscription"
  ON public.pro_subscriptions FOR SELECT
  USING (auth.uid() = user_id OR public.has_role('super_admin'::app_role));

CREATE POLICY "Admins manage pro subscriptions"
  ON public.pro_subscriptions FOR ALL
  USING (public.has_role('super_admin'::app_role))
  WITH CHECK (public.has_role('super_admin'::app_role));

CREATE TRIGGER trg_pro_subs_updated
  BEFORE UPDATE ON public.pro_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.is_pro_user(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.pro_subscriptions
    WHERE user_id = _user_id
      AND status IN ('active','trial')
      AND (expires_at IS NULL OR expires_at > now())
  );
$$;

-- ============ Broker Health Score ============
ALTER TABLE public.brokers
  ADD COLUMN IF NOT EXISTS health_score numeric(5,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS health_breakdown jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS health_updated_at timestamptz;

CREATE OR REPLACE FUNCTION public.calc_broker_health_score(_broker_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_complaints int;
  v_recent_complaints int;
  v_scam_alerts int;
  v_avg_rating numeric;
  v_review_count int;
  v_proof_count int;
  v_score numeric := 100;
  v_breakdown jsonb;
BEGIN
  IF _broker_id IS NULL THEN RETURN; END IF;

  SELECT COUNT(*) INTO v_complaints
  FROM public.complaints WHERE broker_id = _broker_id AND status = 'published';

  SELECT COUNT(*) INTO v_recent_complaints
  FROM public.complaints
  WHERE broker_id = _broker_id AND status = 'published'
    AND created_at > now() - interval '30 days';

  SELECT COUNT(*) INTO v_scam_alerts
  FROM public.scam_alerts
  WHERE broker_id = _broker_id AND status = 'published';

  SELECT COALESCE(AVG(rating),0), COUNT(*) INTO v_avg_rating, v_review_count
  FROM public.reviews
  WHERE broker_id = _broker_id AND status = 'published' AND rating IS NOT NULL;

  SELECT COUNT(*) INTO v_proof_count
  FROM public.withdrawal_proofs
  WHERE broker_id = _broker_id AND status = 'verified';

  -- Penalties
  v_score := v_score - LEAST(v_complaints * 3, 30);
  v_score := v_score - LEAST(v_recent_complaints * 5, 25);
  v_score := v_score - LEAST(v_scam_alerts * 15, 45);
  IF v_review_count >= 3 THEN
    v_score := v_score + ((v_avg_rating - 3) * 4);
  END IF;
  -- Bonuses
  v_score := v_score + LEAST(v_proof_count * 2, 15);

  IF v_score < 0 THEN v_score := 0; END IF;
  IF v_score > 100 THEN v_score := 100; END IF;

  v_breakdown := jsonb_build_object(
    'complaints_total', v_complaints,
    'complaints_30d', v_recent_complaints,
    'scam_alerts', v_scam_alerts,
    'avg_rating', ROUND(v_avg_rating,2),
    'review_count', v_review_count,
    'verified_proofs', v_proof_count
  );

  UPDATE public.brokers
    SET health_score = ROUND(v_score, 1),
        health_breakdown = v_breakdown,
        health_updated_at = now()
    WHERE id = _broker_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.recalc_all_broker_health()
RETURNS int LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r record; n int := 0;
BEGIN
  FOR r IN SELECT id FROM public.brokers WHERE status = 'published' LOOP
    PERFORM public.calc_broker_health_score(r.id);
    n := n + 1;
  END LOOP;
  RETURN n;
END;
$$;

-- ============ Weekly Audio Digest ============
CREATE TABLE IF NOT EXISTS public.audio_digests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  week_of date NOT NULL UNIQUE,
  title text NOT NULL,
  script text NOT NULL,
  audio_url text,
  duration_seconds int,
  voice_id text,
  status text NOT NULL DEFAULT 'pending', -- pending | generating | ready | failed
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.audio_digests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Audio digests are publicly readable"
  ON public.audio_digests FOR SELECT USING (status = 'ready');

CREATE POLICY "Admins manage audio digests"
  ON public.audio_digests FOR ALL
  USING (public.has_role('super_admin'::app_role))
  WITH CHECK (public.has_role('super_admin'::app_role));

CREATE TRIGGER trg_audio_digests_updated
  BEFORE UPDATE ON public.audio_digests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for podcast audio
INSERT INTO storage.buckets (id, name, public)
  VALUES ('audio-digests', 'audio-digests', true)
  ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Audio digests publicly readable"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'audio-digests');

CREATE POLICY "Service role writes audio digests"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'audio-digests' AND public.has_role('super_admin'::app_role));
