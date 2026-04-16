

# Scam Report Submission System

## বর্তমান অবস্থা
- Scam alerts শুধু **Admin panel** থেকে manually create করা যায়
- Users এর কোনো public form নেই scam report submit করার জন্য
- `complaints` table আছে কিন্তু সেটা broker-specific, scam report না

## সমাধান — "Report a Scam" Flow

### Flow:
1. `/scam-alerts` page এ **"Report a Scam"** button add হবে
2. Button click করলে একটি modal/form খুলবে (logged-in users only)
3. User form fill করবে: Broker/Platform Name, Description, Severity, Amount Lost
4. Submit হলে `scam_alerts` table এ `status = 'pending'` হিসেবে insert হবে
5. Admin approval queue তে যাবে → Admin approve করলে `published` হবে এবং list এ দেখাবে
6. User তার submitted reports dashboard এ দেখতে পারবে

### Database Changes
কোনো schema change লাগবে না — `scam_alerts` table এ already `status`, `created_by`, `story` columns আছে। শুধু RLS policy add করতে হবে যাতে authenticated users insert করতে পারে।

### New RLS Policy (Migration)
```sql
-- Users can insert their own scam reports
CREATE POLICY "Users can insert own scam_alerts"
ON public.scam_alerts FOR INSERT TO authenticated
WITH CHECK (created_by = auth.uid());

-- Users can view own pending scam_alerts
CREATE POLICY "Users can view own scam_alerts"
ON public.scam_alerts FOR SELECT TO authenticated
USING (created_by = auth.uid());
```

### UI Changes

| File | Change |
|------|--------|
| `src/components/scam/ReportScamModal.tsx` | New — Form modal: broker name, description, amount, story |
| `src/pages/ScamAlerts.tsx` | "Report a Scam" button add, modal integrate |
| SQL Migration | RLS policies for user insert + view own |

### Admin Side
Already কাজ করে — `ScamAlertsAdmin.tsx` এ pending reports দেখা ও approve/reject করা যায়। `approval_queue` integration ও আছে।

