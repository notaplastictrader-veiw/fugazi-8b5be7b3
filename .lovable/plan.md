

# Admin Panel — User Details + Excel Export + Date Filter

## সমস্যা
1. **Users & Roles** page এ শুধু User ID দেখায় — নাম, ফোন, ইমেইল, signup date নেই
2. কোনো admin page এ date filter বা Excel download নেই

## সমাধান

### 1. Reusable Admin Utilities — `src/lib/adminExport.ts` (NEW)
- `exportToExcel(data, columns, filename)` function — CSV generate করে `.csv` ফাইল download করবে (Excel compatible)
- Date range filter helper

### 2. `src/components/admin/AdminTableToolbar.tsx` (NEW)
Reusable toolbar component with:
- **Date range filter** — From/To date inputs
- **Download Excel** button — calls `exportToExcel`
- Search input (optional)

### 3. `src/pages/admin/UsersAdmin.tsx` — Major Update
- `user_roles` fetch এর সাথে `profiles` table থেকে join করে user info আনবে
- Table columns: **Name, Email, Phone, Role, Signup Date, Actions**
- Email আনতে: profiles table এ email নেই, তাই `auth.users` access করা যায় না client-side থেকে — একটি **edge function** বানাবো যেটা service role key দিয়ে auth.users থেকে email নিয়ে আসবে
- Date filter + Excel download toolbar add

### 4. Edge Function — `supabase/functions/admin-users/index.ts` (NEW)
- Service role key দিয়ে `auth.admin.listUsers()` call করবে
- User ID, email, created_at return করবে
- শুধু super_admin access (JWT verify)

### 5. Other Admin Pages — Date Filter + Download Add
এই pages গুলোতে `AdminTableToolbar` add করবো:
| Page | Filter By | Download Columns |
|------|-----------|-----------------|
| UsersAdmin | signup date | Name, Email, Phone, Role, Date |
| ReviewsAdmin | created_at | Author, Rating, Content, Status, Date |
| ComplaintsAdmin | created_at | Content, Status, Date |
| ScamAlertsAdmin | created_at | Title, Severity, Status, Date |
| BrokersAdmin | created_at | Name, Type, Score, Status, Date |
| ApplicationsAdmin | created_at | Email, Role, Status, Date |

### Implementation Order
1. Create `adminExport.ts` utility (CSV export helper)
2. Create `AdminTableToolbar.tsx` component
3. Create `admin-users` edge function for email data
4. Update `UsersAdmin.tsx` — join profiles + edge function for emails + toolbar
5. Add toolbar to ReviewsAdmin, ComplaintsAdmin, ScamAlertsAdmin, BrokersAdmin, ApplicationsAdmin

### Technical Notes
- CSV format ব্যবহার করবো (`.csv`) — Excel এ সরাসরি open হয়, কোনো extra library লাগে না
- Date filter client-side করবো (data already fetched) — simple and fast
- Edge function এ JWT verify + role check করবো security এর জন্য

