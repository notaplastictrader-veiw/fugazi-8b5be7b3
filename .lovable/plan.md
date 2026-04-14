

# Broker Role-Aware User Dropdown

## সমস্যা
Broker হিসেবে login করার পরেও dropdown এ শুধু regular user menu দেখাচ্ছে (My Profile, My Reviews, My Complaints, Signal Subscriptions)। Broker-specific options নেই।

## সমাধান

### `src/components/UserDropdown.tsx` পরিবর্তন:

1. **`useUserRole` hook import করো** — user এর roles check করতে
2. **Role-based menu items** — roles অনুযায়ী আলাদা menu দেখাবে:

   **Broker role থাকলে:**
   - 🏢 Broker Dashboard → `/admin/broker-dashboard`
   - 📊 My Listings → `/admin/broker-dashboard`
   - 👤 My Profile → `/profile`
   - ⚙️ Settings → `/dashboard/settings`

   **Signal Provider role থাকলে:**
   - 📡 Signal Dashboard → `/admin/signal-dashboard`
   - 👤 My Profile → `/profile`
   - ⚙️ Settings → `/dashboard/settings`

   **Admin roles (super_admin/content_ops/moderator) থাকলে:**
   - 🛡️ Admin Panel → `/admin`
   - 👤 My Profile → `/profile`

   **Regular user (default):**
   - Current menu items (My Profile, My Reviews, My Complaints, Signal Subscriptions)

3. **Role badge** — Dropdown header এ role name দেখাবে (e.g., "Broker", "Signal Provider", "Admin") — email এর নিচে ছোট badge

### একটাই ফাইল change:
| File | Change |
|------|--------|
| `src/components/UserDropdown.tsx` | Add `useUserRole`, show role-specific menu items & role badge |

