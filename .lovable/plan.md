

# A to Z Audit — সব সমস্যা ও ফিক্স

## সমস্যাগুলো যা পাওয়া গেছে

### 1. Signup এ Role Assign হয় না (ROOT CAUSE)
BWP PRIME (gogang735@gmail.com) broker হিসেবে signup করেছে, application table এ `status: "pending"` entry আছে, কিন্তু `user_roles` table এ কোনো role নেই। শুধু Boss (super admin) এর roles আছে।

**কারণ:** AuthModal signup flow `applications` table এ insert করে কিন্তু role assign করে না — admin approval এর জন্য অপেক্ষা করে। কিন্তু **applications approve করার কোনো admin page নেই।**

### 2. Claims Approve করলেও Role Assign হয়নি
4টা claim "approved" status এ আছে কিন্তু কোনো role insert হয়নি। কারণ এগুলো আগের code দিয়ে approve হয়েছিল যখন role-assignment code ছিল না।

### 3. Applications Admin Page নেই
`applications` table এ pending applications আছে (broker, signal_provider) কিন্তু approve/reject করার কোনো UI নেই। SubmissionsAdmin শুধু bug reports/feature requests handle করে, applications না।

### 4. Dropdown সঠিক কিন্তু Role নেই বলে Regular User Menu দেখায়
UserDropdown code সঠিক — role check করে। কিন্তু যেহেতু কোনো role নেই, সবসময় default "regular user" menu দেখায়।

### 5. Login Broker Tab — "No provider account"
Login page broker tab ঠিকই role check করে। Role নেই বলে error দেয়। এটা expected behavior, role assign হলে ঠিক হবে।

---

## সমাধান

### Step 1: Applications Admin Page তৈরি
`src/pages/admin/ApplicationsAdmin.tsx` — নতুন page যেখানে admin:
- সব pending applications দেখবে (broker, signal_provider, betting_site)
- Approve করলে `user_roles` table এ role insert হবে
- Reject করলে status "rejected" হবে
- Admin route এ `/admin/applications` path add

### Step 2: Admin Sidebar এ Applications link add
`AdminSidebar.tsx` এ "Applications" menu item add করা।

### Step 3: App.tsx এ route add
`/admin/applications` route add করা।

### Step 4: Permission Matrix update
`useUserRole.ts` এ `applications` section add করা — শুধু `super_admin` access।

---

## Technical Changes

| File | Change |
|------|--------|
| `src/pages/admin/ApplicationsAdmin.tsx` | **নতুন** — Applications review page. Fetch from `applications` table, approve → insert `user_roles`, reject → update status |
| `src/components/admin/AdminSidebar.tsx` | Add "Applications" link |
| `src/App.tsx` | Add `/admin/applications` route |
| `src/hooks/useUserRole.ts` | Add `applications: ["super_admin"]` to PERMISSION_MATRIX |

No database migration needed — `applications` and `user_roles` tables already exist with correct structure. RLS on `user_roles` allows super_admin to insert.

