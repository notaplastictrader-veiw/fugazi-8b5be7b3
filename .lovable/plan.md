

# Phase 4: 4-Tier Admin System with Role-Based Access & Approval Workflows

## Overview
বর্তমানে শুধু `super_admin` role check করে admin panel access দেওয়া হচ্ছে। Phase 4 এ 4-tier role system implement করবো যেখানে প্রতিটি role এর আলাদা permissions এবং approval workflow থাকবে।

---

## Existing Roles (already in DB enum)
`super_admin` | `content_ops` | `moderator` | `user` | `broker` | `signal_provider`

---

## Part A: Role-Based Admin Access

### 1. Create `useUserRole` hook
Replace the binary `useAdminRole` with a more flexible hook that returns the user's role(s) and permission checks:
- `hasRole(role)` — check specific role
- `hasAnyRole([...roles])` — check multiple roles
- `canAccess(section)` — check if user can access a specific admin section

### 2. Permission Matrix
| Section | super_admin | content_ops | moderator | broker/signal_provider |
|---------|-------------|-------------|-----------|----------------------|
| Dashboard | ✅ | ✅ | ✅ | ✅ (own only) |
| Brokers CRUD | ✅ | ✅ | ❌ | ❌ |
| Signals CRUD | ✅ | ✅ | ❌ | ❌ |
| Reviews | ✅ | ✅ | ✅ (moderate) | ❌ |
| Complaints | ✅ | ✅ | ✅ | ❌ |
| Scam Alerts | ✅ | ✅ | ❌ | ❌ |
| Approval Queue | ✅ | ✅ | ✅ | ❌ |
| Users & Roles | ✅ | ❌ | ❌ | ❌ |
| Revenue | ✅ | ❌ | ❌ | ❌ |
| Site Settings | ✅ | ❌ | ❌ | ❌ |
| News/Promos/Calendar | ✅ | ✅ | ✅ | ❌ |
| Broker Dashboard | ✅ | ❌ | ❌ | ✅ (own) |
| Signal Dashboard | ✅ | ❌ | ❌ | ✅ (own) |

### 3. Update `ProtectedAdminRoute`
- Accept `requiredRoles` prop instead of just checking `super_admin`
- Show "Access Denied" page instead of redirecting for authenticated but unauthorized users

### 4. Update `AdminSidebar`
- Filter menu items based on user's role
- Each sidebar item gets a `roles` array defining who can see it

---

## Part B: Enhanced Approval Workflow

### 5. Database: Add `audit_log` table
Track all admin actions for accountability:
- `id`, `user_id`, `action` (create/update/delete/approve/reject), `table_name`, `record_id`, `old_data`, `new_data`, `created_at`
- RLS: super_admin can read all, others can read own

### 6. Content submission flow
- `content_ops` creates content → status = `draft`
- `content_ops` submits for review → auto-inserts into `approval_queue` with status `pending`
- `moderator` or `super_admin` approves/rejects from queue
- On approval → content status becomes `published`
- On rejection → content status becomes `rejected` with reviewer notes

### 7. Approval Queue enhancements
- Show who submitted the content (join with profiles)
- Add reviewer notes field before approve/reject
- Filter by content type tabs
- Show content preview in expandable row

---

## Part C: Broker & Signal Provider Portals

### 8. Broker Portal (for users with `broker` role)
- See their own broker listing stats (views, reviews, complaints)
- Edit their broker profile (submits to approval queue, not direct publish)
- View and respond to complaints filed against them
- Access lead/inquiry data

### 9. Signal Provider Portal (for users with `signal_provider` role)
- See their signal group stats
- Edit signal group info (submits to approval queue)
- View subscriber/member analytics

---

## Technical Details

### New Files
- `src/hooks/useUserRole.ts` — flexible role checking hook
- `src/pages/admin/AccessDenied.tsx` — unauthorized access page
- `src/pages/admin/AuditLog.tsx` — admin action history
- `src/components/admin/ProtectedSection.tsx` — wrapper for role-gated sections
- 1 migration: `audit_log` table

### Modified Files
- `src/hooks/useAdminRole.ts` → refactored into `useUserRole.ts`
- `src/components/admin/ProtectedAdminRoute.tsx` — accept `requiredRoles` array
- `src/components/admin/AdminSidebar.tsx` — role-based menu filtering
- `src/pages/admin/ApprovalQueueAdmin.tsx` — enhanced with notes, previews, tabs
- `src/App.tsx` — role-gated admin sub-routes

### Implementation Order
1. `useUserRole` hook + permission matrix
2. Update `ProtectedAdminRoute` with role support
3. Role-filtered `AdminSidebar`
4. `audit_log` migration
5. Enhanced Approval Queue UI
6. Broker portal pages
7. Signal provider portal pages
8. Audit log viewer page

