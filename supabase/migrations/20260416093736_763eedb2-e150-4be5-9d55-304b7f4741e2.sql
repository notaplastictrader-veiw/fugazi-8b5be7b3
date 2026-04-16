-- Allow pre-confirmation signups (anon role) to insert applications
CREATE POLICY "Anon can insert applications for existing users"
ON public.applications FOR INSERT TO anon
WITH CHECK (user_id IS NOT NULL AND EXISTS (SELECT 1 FROM auth.users WHERE id = user_id));

-- Auto-notify all super_admin users when a new application is created
CREATE OR REPLACE FUNCTION public.notify_admins_on_application()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO notifications (user_id, type, title, message, link)
  SELECT ur.user_id, 'admin', 'New ' || NEW.role || ' Application',
    COALESCE(NEW.contact_email, 'Unknown') || ' submitted a ' || NEW.role || ' application',
    '/admin/approvals'
  FROM user_roles ur WHERE ur.role = 'super_admin';
  RETURN NEW;
END; $$;

CREATE TRIGGER on_new_application
AFTER INSERT ON public.applications
FOR EACH ROW EXECUTE FUNCTION public.notify_admins_on_application();