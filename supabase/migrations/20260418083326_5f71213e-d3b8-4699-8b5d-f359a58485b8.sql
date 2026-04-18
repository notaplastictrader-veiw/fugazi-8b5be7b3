-- Create support_messages table
CREATE TABLE public.support_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  sender_role TEXT NOT NULL,
  context_name TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  admin_response TEXT,
  responded_at TIMESTAMP WITH TIME ZONE,
  responded_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;

-- Senders can insert their own
CREATE POLICY "Users can insert own support messages"
ON public.support_messages
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Senders can view their own
CREATE POLICY "Users can view own support messages"
ON public.support_messages
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Super admins full access
CREATE POLICY "Admins full access support_messages"
ON public.support_messages
FOR ALL
TO authenticated
USING (has_role('super_admin'::app_role))
WITH CHECK (has_role('super_admin'::app_role));

-- Updated_at trigger
CREATE TRIGGER update_support_messages_updated_at
BEFORE UPDATE ON public.support_messages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Notify admins on new support message
CREATE OR REPLACE FUNCTION public.notify_admins_on_support_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO notifications (user_id, type, title, message, link)
  SELECT ur.user_id,
    'support',
    '[Priority] ' || NEW.subject,
    'From ' || COALESCE(NEW.context_name, NEW.sender_role) || ': ' || left(NEW.message, 140),
    '/admin/support'
  FROM user_roles ur
  WHERE ur.role = 'super_admin';
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_notify_admins_on_support_message
AFTER INSERT ON public.support_messages
FOR EACH ROW
EXECUTE FUNCTION public.notify_admins_on_support_message();

-- Helpful indexes
CREATE INDEX idx_support_messages_user_id ON public.support_messages(user_id);
CREATE INDEX idx_support_messages_status ON public.support_messages(status);
CREATE INDEX idx_support_messages_created_at ON public.support_messages(created_at DESC);