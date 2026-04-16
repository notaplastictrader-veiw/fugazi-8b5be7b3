-- Recreate the missing trigger on auth.users for profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Notify super admins when a new user profile is created (any signup)
CREATE OR REPLACE FUNCTION public.notify_admins_on_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO notifications (user_id, type, title, message, link)
  SELECT ur.user_id, 'admin', 'New User Signed Up',
    COALESCE(NEW.full_name, 'Unknown') || ' just created an account.',
    '/admin/users'
  FROM user_roles ur WHERE ur.role = 'super_admin';
  RETURN NEW;
END; $$;

CREATE TRIGGER on_new_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_admins_on_new_user();