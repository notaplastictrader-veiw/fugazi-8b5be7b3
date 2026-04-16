

# Fix: Application Insert Failing Silently (RLS + No Session)

## সমস্যা
Broker/Signal/Betting signup করলে `signUp()` এর পর user এর session থাকে না (email confirm লাগে)। তাই:
- `applications` table এ insert RLS block করে (`auth.uid()` is null)
- `notifyAdmins()` ও fail হয় (notifications insert ও authenticated লাগে)
- কিন্তু code error check করে না, তাই user কে "Application Submitted!" দেখায় — actually কিছু save হয়নি

## সমাধান

### 1. Database Migration
- `applications` table এ **anon INSERT policy** add করবো — শুধু তখন allow করবে যখন `user_id` auth.users এ exist করে
- একটা **SECURITY DEFINER trigger function** create করবো — নতুন application insert হলে automatically সব super_admin দের `notifications` table এ notify করবে (RLS bypass করে)

```sql
-- Allow pre-confirmation signups to insert applications
CREATE POLICY "Anon can insert applications for existing users"
ON public.applications FOR INSERT TO anon
WITH CHECK (user_id IS NOT NULL AND EXISTS (SELECT 1 FROM auth.users WHERE id = user_id));

-- Auto-notify admins on new application
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
```

### 2. `src/components/modals/AuthModal.tsx`
- `notifyAdmins()` call remove করবো (trigger handle করবে)
- Application insert এ **error checking** add করবো — fail হলে user কে error message দেখাবো, success হলেই "Application Submitted" screen দেখাবো

```typescript
const { error: appError } = await supabase.from("applications").insert({...});
if (appError) {
  setLoading(false);
  toast.error("Failed to submit application. Please try again.");
  return;
}
// Only show under review if insert succeeded
setShowUnderReview(true);
```

## Files Changed

| File | Change |
|------|--------|
| Migration SQL | Anon INSERT policy for `applications` + trigger for auto-notify admins |
| `src/components/modals/AuthModal.tsx` | Remove `notifyAdmins()`, add error handling on insert |

