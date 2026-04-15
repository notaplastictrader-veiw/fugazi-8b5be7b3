

# Combined Fix: RLS + Claims Admin + Claim Page

## 4 Problems, 1 Plan

### Problem 1: Broker/Signal can't see own draft listings (RLS)
`brokers` and `signal_groups` tables only allow `super_admin` or `status='published'`. Creators with `created_by = auth.uid()` get empty results.

### Problem 2: Claims admin shows UUIDs, not human info
No join to `profiles` for claimant name/email/phone. No lookup of broker/signal/betting entity name.

### Problem 3: Only brokers can be claimed
`BrokerClaimProfile.tsx` is hardcoded to search `brokers` only. No signal/betting support.

### Problem 4: No contact info collected on claim submission
Claim form only saves `documents_url`. No company name, position, or contact details.

---

## Solution

### Step 1: Database Migration — RLS Policies
Add SELECT + UPDATE policies for creators on `brokers`, `signal_groups`, and `betting_profiles`:

```sql
-- Brokers: creator can view & update own
CREATE POLICY "Creators can view own brokers"
ON public.brokers FOR SELECT TO authenticated
USING (created_by = auth.uid());

CREATE POLICY "Creators can update own brokers"
ON public.brokers FOR UPDATE TO authenticated
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

-- Signal groups: creator can view & update own
CREATE POLICY "Creators can view own signal_groups"
ON public.signal_groups FOR SELECT TO authenticated
USING (created_by = auth.uid());

CREATE POLICY "Creators can update own signal_groups"
ON public.signal_groups FOR UPDATE TO authenticated
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

-- Betting profiles: claimed_by can view & update own
CREATE POLICY "Creators can view own betting_profiles"
ON public.betting_profiles FOR SELECT TO authenticated
USING (claimed_by = auth.uid());

CREATE POLICY "Creators can update own betting_profiles"
ON public.betting_profiles FOR UPDATE TO authenticated
USING (claimed_by = auth.uid())
WITH CHECK (claimed_by = auth.uid());
```

### Step 2: Add `contact_info` column to `profile_claims`
Store claimant's submitted contact details (company, position, email, phone) as JSONB:

```sql
ALTER TABLE public.profile_claims
ADD COLUMN contact_info jsonb DEFAULT '{}'::jsonb;
```

### Step 3: Update `BrokerClaimsAdmin.tsx`
- After fetching claims, do secondary queries to:
  - Fetch claimant profiles (`profiles` table) by `claimed_by` IDs → get name, phone, country, email (from auth if needed)
  - Fetch entity names: broker names from `brokers`, signal names from `signal_groups`, betting names from `betting_profiles`
- Claims list shows: **Claimant Name** claiming **Entity Name** (type) instead of UUIDs
- Review modal shows: Claimant full name, phone, country, contact_info JSON fields, entity name, docs URL, admin note input

### Step 4: Update `BrokerClaimProfile.tsx` → Support all 3 types
- Add tabs: **Broker** | **Signal Group** | **Betting Site**
- Each tab searches its respective table
- Claim form adds fields: Company Name, Position, Contact Email, Contact Phone
- On submit: saves `profile_type` based on active tab, saves contact fields into `contact_info` JSONB column

---

## Files Changed

| File | Change |
|------|--------|
| DB Migration | RLS policies for brokers, signal_groups, betting_profiles + contact_info column |
| `src/pages/admin/BrokerClaimsAdmin.tsx` | Join profiles + entity tables, show human-readable info in list and review modal |
| `src/pages/BrokerClaimProfile.tsx` | Add 3 tabs, contact info fields, dynamic profile_type |

