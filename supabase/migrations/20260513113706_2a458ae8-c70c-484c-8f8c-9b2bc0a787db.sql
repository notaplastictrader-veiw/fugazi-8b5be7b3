
CREATE TABLE public.trade_journal (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  symbol TEXT NOT NULL,
  side TEXT NOT NULL CHECK (side IN ('long','short')),
  entry_price NUMERIC,
  exit_price NUMERIC,
  size NUMERIC,
  pnl NUMERIC,
  rr NUMERIC,
  notes TEXT,
  outcome TEXT CHECK (outcome IN ('win','loss','breakeven','open')) DEFAULT 'open',
  opened_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  closed_at TIMESTAMPTZ,
  broker_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_trade_journal_user ON public.trade_journal(user_id, opened_at DESC);

ALTER TABLE public.trade_journal ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own trades" ON public.trade_journal FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own trades" ON public.trade_journal FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own trades" ON public.trade_journal FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own trades" ON public.trade_journal FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER trade_journal_updated_at
  BEFORE UPDATE ON public.trade_journal
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
