

# Full System Audit — সব সমস্যা ও সমাধান

## Audit Summary

আমি প্রতিটা role হিসেবে পুরো system check করেছি। নিচে সব সমস্যা ও সমাধান:

---

## সমস্যা তালিকা

### 🔴 CRITICAL: Security — Broker/Signal/Betting users can see FULL Super Admin panel
**Problem:** `/admin` route এ `ProtectedAdminRoute` শুধু check করে `canAccessAdmin` — যেটা broker, signal_provider, betting_site সবাইকে allow করে। AdminLayout + AdminSidebar তে সব section দেখায়। যদিও sidebar filtering আছে, কিন্তু **URL direct type করলে** broker user `/admin/users`, `/admin/settings`, `/admin/revenue` সব access করতে পারে কারণ individual route-এ কোনো `requiredRoles` guard নেই।

### 🔴 CRITICAL: Provider dashboards are INSIDE admin panel
Broker/Signal/Betting dashboard গুলো `/admin/broker-dashboard` এ আছে — মানে providers কে AdminLayout (admin sidebar, admin header) দেখতে হয়। তাদের নিজস্ব isolated panel নেই।

### 🔴 CRITICAL: No provider profiles exist
Database check: `broker_profiles`, `signal_profiles`, `betting_profiles` tables সব **empty**। Application approve করলে শুধু role assign হয় কিন্তু কোনো profile create হয় না। তাই BrokerDashboard এ ঢুকলে "NO BROKER LISTING LINKED TO YOUR ACCOUNT" দেখায়।

### 🟡 Major: content_ops ও moderator roles অব্যবহৃত
তুমি (owner) নিজে সব করবে। এই roles গুলো শুধু complexity বাড়াচ্ছে। Dashboard.tsx এ 5টা আলাদা dashboard component আছে (SuperAdmin, ContentOps, Broker, Signal, Moderator, Sports) — বেশিরভাগই unnecessary।

### 🟡 Major: Signup flow role-specific তথ্য collect করে কিন্তু কোথাও ব্যবহার হয় না
AuthModal signup এ broker এর জন্য company_name, website, regulation etc. collect হয় `applications` table এ, কিন্তু approve করলে শুধু role assign হয়, broker entry বা broker_profile create হয় না।

### 🟡 Major: Login broker tab — "No provider account" error
Broker role approve হওয়ার পরেও, `redirectByTab` check করে `roles.includes("betting_site")` — কিন্তু betting_site role থাকলে কোথায় redirect করবে সেটা handle করা নেই (Login.tsx line 55-64)।

### 🟠 Minor: Duplicate signup systems
`AuthModal.tsx` (modal) এবং `Signup.tsx` (page) — দুইটা আলাদা signup system আছে। `Signup.tsx` page এ কোনো role selection নেই, শুধু basic email/password signup। `AuthModal.tsx` এ role-specific fields আছে।

---

## সমাধান Plan

### Architecture Redesign:

```text
/admin/*          → ONLY for owner (super_admin) — full control panel
/portal/broker/*  → Broker's own isolated dashboard  
/portal/signal/*  → Signal Provider's own isolated dashboard
/portal/betting/* → Betting Site's own isolated dashboard
/dashboard/*      → Regular user dashboard (keep as is)
```

### Step 1: Create Provider Portal Layout & Routes
**New file:** `src/components/portal/ProviderLayout.tsx`  
- Simple layout with provider-specific sidebar (NOT admin sidebar)
- Shows only their relevant menu items (My Dashboard, My Profile, Upgrade, Settings)

**New file:** `src/components/portal/ProviderSidebar.tsx`  
- Role-aware sidebar: broker sees broker items, signal sees signal items

### Step 2: Move provider dashboards to `/portal/*`
- `/portal/broker` → BrokerDashboard
- `/portal/signal` → SignalDashboard  
- `/portal/betting` → SportsDashboard
- Each wrapped in `ProviderLayout` with role-specific guard

### Step 3: Lock down `/admin` to super_admin ONLY
- Remove broker/signal_provider/betting_site from `canAccessAdmin`
- Remove content_ops/moderator from ProtectedAdminRoute (just super_admin)
- Remove ModeratorLayout/ModeratorDashboard routes
- Clean AdminSidebar: remove role-based filtering, show all sections always (since only super_admin sees it)

### Step 4: Fix Application Approval → Create Profile
When admin approves an application:
- Insert `user_roles` (already done)  
- **Also create** `broker_profiles`/`signal_profiles`/`betting_profiles` entry with `claimed_by = user_id`
- For broker: also create entry in `brokers` table using application_data (company_name as name, etc.)
- For signal: create entry in `signal_groups` table
- For betting: create entry in `betting_profiles` table

### Step 5: Fix UserDropdown links
- Broker → `/portal/broker`
- Signal → `/portal/signal`  
- Betting → `/portal/betting`
- Super admin → `/admin`
- Regular user → `/dashboard`

### Step 6: Fix Login redirect
- Broker tab → `/portal/broker`
- Add betting_site handling → `/portal/betting`
- Admin tab → `/admin`

### Step 7: Remove unused roles/components
- Remove content_ops, moderator from active use  
- Remove ModeratorLayout, ModeratorDashboard, ContentOpsDashboard
- Simplify Dashboard.tsx to just SuperAdminDashboard

---

## Technical Changes Summary

| File | Change |
|------|--------|
| `src/components/portal/ProviderLayout.tsx` | **New** — isolated provider portal layout |
| `src/components/portal/ProviderSidebar.tsx` | **New** — role-aware provider sidebar |
| `src/App.tsx` | Add `/portal/*` routes, remove moderator routes, add guards |
| `src/pages/admin/Dashboard.tsx` | Simplify to just SuperAdminDashboard |
| `src/pages/admin/ApplicationsAdmin.tsx` | On approve: create broker/signal/betting profile + listing |
| `src/components/admin/ProtectedAdminRoute.tsx` | Lock to super_admin only |
| `src/components/admin/AdminSidebar.tsx` | Remove role-based filtering, always show all |
| `src/hooks/useUserRole.ts` | Remove unused PERMISSION_MATRIX entries, simplify |
| `src/components/UserDropdown.tsx` | Update portal links |
| `src/pages/Login.tsx` | Fix redirect paths, add betting_site support |
| `src/components/modals/AuthModal.tsx` | Fix redirect paths |

No database migrations needed — all tables exist with correct structure.

