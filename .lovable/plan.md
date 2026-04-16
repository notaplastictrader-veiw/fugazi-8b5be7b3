

# Fix: Applications Pending Count & Notification Link

## সমস্যা
1. নতুন application আসলে admin notification এর link `/admin/approvals` এ যায়, কিন্তু applications আছে `/admin/applications` এ
2. Admin Dashboard এ "Pending" count শুধু `approval_queue` table থেকে আসে — `applications` table এর pending count include করে না
3. Dashboard এ applications এর কোনো stat বা quick action নেই

## সমাধান

### 1. `src/components/modals/AuthModal.tsx`
- `notifyAdmins()` call এ link `/admin/approvals` → `/admin/applications` change করবো

### 2. `src/pages/admin/Dashboard.tsx`
- Stats interface এ `pendingApplications` add করবো
- `fetchAll` এ `applications` table থেকে pending count query add করবো
- Primary stats বা Quick Actions এ "Applications" item add করবো badge সহ
- Pending stat এ applications count ও include করবো

## Files Changed

| File | Change |
|------|--------|
| `src/components/modals/AuthModal.tsx` | Fix notification link to `/admin/applications` |
| `src/pages/admin/Dashboard.tsx` | Add pending applications count to stats + quick actions |

