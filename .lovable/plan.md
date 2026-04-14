

# UserDropdown ও Broken Routes Fix

## সমস্যাগুলো

### 1. Broken Links (404 দেয়)
UserDropdown এ যেসব link আছে সেগুলোর routes App.tsx এ নেই:
- `/profile` → route নেই (আছে `/profile/:username`)
- `/my-reviews` → route নেই (আছে `/dashboard/reviews`)
- `/my-complaints` → route নেই (আছে `/dashboard/complaints`)
- `/subscriptions` → route নেই (কোনো route-ই নেই)

### 2. Role Priority Issue
তোমার account এ সব roles আছে (super_admin, broker, signal_provider, betting_site, etc.)। কিন্তু `getMenuItems()` এ **broker** সবার আগে check হয়, তাই সবসময় broker menu দেখায়। Super admin হওয়া সত্ত্বেও Admin Panel দেখায় না।

### 3. Betting Site role এর কোনো menu নেই
`betting_site` role এর জন্য কোনো specific menu items নেই।

## সমাধান

### `src/components/UserDropdown.tsx`:

1. **Role priority fix** — Check order ঠিক করা:
   - `super_admin` → Admin Panel first
   - `content_ops` / `moderator` → Admin Panel
   - `broker` → Broker Dashboard
   - `signal_provider` → Signal Dashboard
   - `betting_site` → Betting Dashboard
   - Regular user → User dashboard links

2. **Broken href fix**:
   - `/profile` → `/dashboard` (or `/profile/${username}`)
   - `/my-reviews` → `/dashboard/reviews`
   - `/my-complaints` → `/dashboard/complaints`
   - `/subscriptions` → `/signals` (public signals page)

3. **Betting site menu** add:
   - Betting Dashboard → `/admin/betting-dashboards`
   - My Profile → `/dashboard`
   - Settings → `/dashboard/settings`

4. **Multiple roles case** — Super admin সবসময় top priority পাবে, তারপর admin roles, তারপে provider roles।

### Changes Summary

| File | Change |
|------|--------|
| `src/components/UserDropdown.tsx` | Fix role priority order (admin first), fix all broken hrefs, add betting_site menu |

