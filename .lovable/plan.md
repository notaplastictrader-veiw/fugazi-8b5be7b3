

# Mobile/Tablet — User Dropdown Menu Missing

## সমস্যা
Mobile menu তে logged-in user এর জন্য শুধু নাম আর "Log Out" button আছে। Desktop এ যে dropdown menu দেখায় (Admin Panel, Dashboard, Settings, role badge) সেগুলো mobile menu তে নেই।

## সমাধান

### `src/components/layout/Navbar.tsx` — Mobile menu এর user section update

Lines 243-254 এ logged-in user block এ desktop dropdown এর মতো full menu items add করবো:

1. **Role badge** দেখাবে (Super Admin, Broker, etc.) — `useUserRole` hook use করে
2. **Menu items** — Desktop `UserDropdown` এর same logic follow করে role-based links দেখাবে:
   - Super Admin → Admin Panel, Dashboard, Settings
   - Broker → Broker Portal, Dashboard, Settings
   - Signal Provider → Signal Portal, Dashboard, Settings
   - Regular User → Dashboard, My Reviews, My Complaints, Settings
3. **Log Out** button থাকবে নিচে

### Changes — 1 file

| File | Change |
|------|--------|
| `src/components/layout/Navbar.tsx` | Mobile menu তে `useUserRole` import, role badge + full nav links add (lines ~243-254) |

Desktop dropdown (`UserDropdown.tsx`) এর same `getMenuItems()` logic replicate করবো mobile menu তে, কিন্তু inline style এ (dropdown নয়, list আকারে)।

