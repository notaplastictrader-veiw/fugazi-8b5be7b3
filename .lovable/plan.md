

## Issue
"No admins available right now" toast আসছে কারণ `ContactAdminDialog` client-side query করছে `user_roles WHERE role='super_admin'` — কিন্তু broker user-এর RLS শুধু **নিজের role row** দেখতে দেয়, super_admin rows hidden। তাই empty array → false negative।

DB-তে super_admin আছে ✅ (verified)। শুধু query strategy ভুল।

## Fix Plan

**Approach: dedicated `support_messages` table + better UX** (cleaner than RPC hack on notifications)

### 1. New table `support_messages`
```
id, user_id (sender), sender_role text, context_name text,
subject text, message text, status text default 'open'
('open'|'in_progress'|'resolved'), admin_response text,
created_at, responded_at
```

RLS:
- INSERT: any authenticated user (their own row)
- SELECT: sender sees own; super_admin sees all
- UPDATE: super_admin only (to set status / admin_response)

### 2. Trigger → notify admins
On INSERT into `support_messages`, a SECURITY DEFINER trigger fans out a notification to every super_admin (server-side, bypasses RLS — same pattern as existing `notify_admins_on_application`).

### 3. Refactor `ContactAdminDialog.tsx`
- Remove the broken `user_roles` query
- Just `INSERT INTO support_messages` with subject/message/sender_role/context_name
- Toast: **"Message received. Our team will reach out within 24 hours."**
- Keep dialog reusable across Broker / Signal / Betting portals (already is)

### 4. Admin inbox (small)
- New admin route `/admin/support` listing all support_messages
- Filters: status (open/in_progress/resolved), sender role
- Click → view full message + add admin_response + change status
- Add sidebar entry for super_admin only
- Add to `AdminSidebar.tsx` under existing groupings

## Files to Touch
- 1 SQL migration → `support_messages` table + RLS + notify trigger
- `src/components/portal/ContactAdminDialog.tsx` — rewrite send logic + new toast
- `src/pages/admin/SupportMessagesAdmin.tsx` (new) — admin inbox
- `src/App.tsx` — register route
- `src/components/admin/AdminSidebar.tsx` — sidebar link

## Out of Scope
- Email notification to user when admin responds (in-app only for now)
- Threaded conversation (single message + single admin response)
- File attachments in support messages
- SLA tracking / auto-escalation

