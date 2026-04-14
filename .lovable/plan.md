

# Claim Flow Fix — সমস্যা ও সমাধান

## Current Problems

1. **Auto-claim without proof** — Logged-in user "Claim This Profile" click করলেই সাথে সাথে claimed হয়ে যায়, কোনো document/proof চাওয়া হয় না, status সরাসরি `approved` হয়ে যায়
2. **No admin approval** — Claim সরাসরি approve হয়ে যায়, super admin এর কাছে review এর জন্য যায় না
3. **Same credentials, multiple roles** — একই user একবার claim করলে broker role পায় এবং admin panel + broker dashboard দুটোতেই access পায় (যদি আগে থেকে admin role থাকে)
4. **Signup flow auto-claims** — Signup এর পরে `AuthContext` এ pending claim auto-approve হয়ে যায়

## Solution

### 1. BrokerDetail.tsx — Claim button → Proof form modal
- "Claim This Profile" click করলে **inline form/modal** open হবে
- Form fields: Company Name, Your Position/Role, Proof Document URL (Google Drive/Dropbox link), Contact Email
- Submit করলে `profile_claims` table এ `status: "pending"` দিয়ে insert হবে
- **কোনো role assign হবে না**, কোনো `broker_profiles` update হবে না
- UI তে "Pending Review" badge দেখাবে submit এর পরে
- Logged out হলে `/signup?role=broker&broker_id=X` এ redirect (same as now)

### 2. Signup.tsx + AuthContext.tsx — Remove auto-claim
- `AuthContext` থেকে `pending-broker-claim` auto-processing logic সম্পূর্ণ **remove** করা হবে
- Signup page এ `sessionStorage.setItem("pending-broker-claim")` **remove**
- Signup এর পরে user কে broker detail page এ redirect করবে, সেখানে claim form submit করবে

### 3. Login role separation already works
- Login page এর tab system ইতিমধ্যে role check করে — broker tab login করলে broker role না থাকলে "No provider account" error দেয়
- Admin tab login করলে admin role না থাকলে "Access denied" দেয়
- **এটা ঠিকই আছে** — সমস্যা ছিল যে claim করলেই broker role auto-assign হতো, সেটা বন্ধ হয়ে গেলে এই problem solve

### 4. Admin approval flow (already exists)
- `/admin/claims` page এ super admin claim approve/reject করতে পারে
- Approve করলেই তখন `broker_profiles` update + `user_roles` এ broker role assign হবে
- এই part `BrokerClaimsAdmin.tsx` এ already implemented আছে, just claims গুলো pending status এ আসতে হবে

## Technical Changes

| File | Change |
|------|--------|
| `src/pages/BrokerDetail.tsx` | Replace `handleDirectClaim()` with claim proof form modal. Submit creates `profile_claims` with `status: "pending"`. No role/profile update. Show "Pending Review" for submitted claims. |
| `src/contexts/AuthContext.tsx` | Remove entire `pending-broker-claim` sessionStorage auto-processing block |
| `src/pages/Signup.tsx` | Remove `sessionStorage.setItem("pending-broker-claim")` line. After broker signup, redirect to broker detail page. |

No database changes needed — `profile_claims` table already supports `pending` status with `documents_url` field.

