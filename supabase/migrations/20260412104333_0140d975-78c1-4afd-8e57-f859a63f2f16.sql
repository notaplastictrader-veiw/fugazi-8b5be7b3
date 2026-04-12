
-- Create audit_log table
CREATE TABLE public.audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  old_data JSONB DEFAULT '{}'::jsonb,
  new_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Super admins full access audit_log"
ON public.audit_log FOR ALL TO authenticated
USING (public.has_role('super_admin'::app_role))
WITH CHECK (public.has_role('super_admin'::app_role));

CREATE POLICY "Users can view own audit_log"
ON public.audit_log FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can insert own audit_log"
ON public.audit_log FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

-- Indexes
CREATE INDEX idx_audit_log_user_id ON public.audit_log(user_id);
CREATE INDEX idx_audit_log_created_at ON public.audit_log(created_at DESC);
CREATE INDEX idx_audit_log_table_name ON public.audit_log(table_name);
