
CREATE TABLE public.withdrawal_proofs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  broker_id UUID REFERENCES public.brokers(id) ON DELETE CASCADE NOT NULL,
  amount NUMERIC,
  currency TEXT DEFAULT 'USD',
  withdrawal_date DATE,
  payout_method TEXT,
  payout_time_hours INTEGER,
  proof_url TEXT NOT NULL,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_withdrawal_proofs_broker ON public.withdrawal_proofs(broker_id, status);
CREATE INDEX idx_withdrawal_proofs_user ON public.withdrawal_proofs(user_id);

ALTER TABLE public.withdrawal_proofs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view verified proofs"
  ON public.withdrawal_proofs FOR SELECT
  USING (status = 'verified');

CREATE POLICY "Users view own proofs"
  ON public.withdrawal_proofs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins view all proofs"
  ON public.withdrawal_proofs FOR SELECT
  TO authenticated
  USING (public.has_role('super_admin') OR public.has_role('content_ops') OR public.has_role('moderator'));

CREATE POLICY "Users submit proofs"
  ON public.withdrawal_proofs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "Users update own pending proofs"
  ON public.withdrawal_proofs FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id AND status = 'pending')
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins update any proof"
  ON public.withdrawal_proofs FOR UPDATE
  TO authenticated
  USING (public.has_role('super_admin') OR public.has_role('content_ops') OR public.has_role('moderator'));

CREATE POLICY "Users delete own pending proofs"
  ON public.withdrawal_proofs FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "Admins delete proofs"
  ON public.withdrawal_proofs FOR DELETE
  TO authenticated
  USING (public.has_role('super_admin'));

CREATE TRIGGER trg_withdrawal_proofs_updated
  BEFORE UPDATE ON public.withdrawal_proofs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
