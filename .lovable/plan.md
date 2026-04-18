

## Root Cause

The RLS policy on `review_replies` (and `review_reads`) requires:
```sql
bp.claim_status = 'approved'
```

But your broker profile has:
- `tier = 'featured'` ✅
- `claim_status = 'claimed'` ❌ (should be `'approved'`)

So even though tier is Featured, the reply INSERT fails because RLS checks `claim_status='approved'` — which it isn't.

This is a data inconsistency: when a super admin upgraded the tier to Featured, `claim_status` was never bumped from `claimed` → `approved`.

## Fix Plan

### 1. SQL migration — sync `claim_status` with `tier`
Two parts:

**(a) Backfill existing rows** on all 3 profile tables:
```sql
UPDATE broker_profiles  SET claim_status='approved' WHERE tier IN ('verified','featured') AND claim_status<>'approved';
UPDATE signal_profiles  SET claim_status='approved' WHERE tier IN ('verified','featured') AND claim_status<>'approved';
UPDATE betting_profiles SET claim_status='approved' WHERE tier IN ('verified','featured') AND claim_status<>'approved';
```

**(b) Extend the existing `sync_tier_flags()` trigger** to also auto-set `claim_status='approved'` whenever `tier` becomes `verified` or `featured`. Keeps future upgrades consistent automatically.

### 2. Loosen RLS check (defensive)
Update the 3 RLS policies on `review_replies` (INSERT/UPDATE/DELETE) and 2 on `review_reads` to use `tier IN ('verified','featured')` as the source of truth instead of `claim_status='approved'`. This way tier is the single authority — matches the gating logic we just put in the UI.

```sql
-- Example new INSERT policy
CREATE POLICY "Broker owner can insert reply" ON review_replies
FOR INSERT TO authenticated
WITH CHECK (
  user_id = auth.uid() AND EXISTS (
    SELECT 1 FROM broker_profiles bp
    WHERE bp.broker_id = review_replies.broker_id
      AND bp.claimed_by = auth.uid()
      AND bp.tier IN ('verified','featured')
  )
);
```

Apply same pattern to UPDATE, DELETE on `review_replies` and INSERT, SELECT on `review_reads`.

## Files to Touch
- 1 SQL migration:
  - Backfill `claim_status` on the 3 profile tables
  - Update `sync_tier_flags()` trigger to also sync `claim_status`
  - DROP + CREATE 5 RLS policies (3 on `review_replies`, 2 on `review_reads`) using `tier` check

No frontend changes needed — UI gating already uses `tier`.

## Out of Scope
- Changing `tier_upgrades` workflow (admin still approves there)
- Renaming `claim_status` field
- Adding an admin UI to manually override claim_status

