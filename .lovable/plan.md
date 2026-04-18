

## Issues Spotted on `/portal/broker` (Featured tier)

1. **Reply & React still locked** for Featured user — should auto-unlock for Verified+ (UI bug: gating logic / refetch stale)
2. **Edit button shows LOCKED** — same gating bug
3. **"My Listing"** sidebar item — currently empty/unclear purpose
4. **"Upgrade Tier"** sidebar item — shows nothing useful; user wants:
   - Current tier status with badge
   - Upgrade CTA (if not Featured)
   - **Cancel Premium** option (new) → opens a cancellation form → submitted to super admin

## Root Cause (Bug #1 + #2)
`BrokerDashboard.tsx` likely reads `tier` from `broker_profiles.tier` but might be checking `is_verified`/`is_featured` boolean fields OR checking against `claim_status='approved'`. Featured row exists but boolean flags `is_verified=false`, `is_featured=false` in DB → gating fails.

Fix: derive `canEdit/canReply/canReact` purely from `tier` string (`tier === 'verified' || tier === 'featured'`), ignore stale boolean columns. OR sync booleans via trigger when tier changes.

## Plan

### 1. Fix tier gating logic (Bug)
In `BrokerDashboard.tsx`, `SignalDashboard.tsx`, `SportsDashboard.tsx`:
- Derive everything from `tier` field only:
  ```
  const canEdit = tier === 'verified' || tier === 'featured';
  const canReply = canEdit;
  const canReact = canEdit;
  ```
- Pass `canReply`/`canReact` correctly to `TierGate` and `ReviewReactions`
- Remove any conditional that uses `is_verified`/`is_featured` booleans for UI gating

### 2. Add DB trigger to sync boolean flags with tier
New migration: trigger on `broker_profiles`/`signal_profiles`/`betting_profiles` BEFORE INSERT/UPDATE → set `is_verified = (tier IN ('verified','featured'))`, `is_featured = (tier = 'featured')`. So booleans stay consistent for any other code path that uses them.

### 3. Rebuild "Upgrade Tier" sidebar page → "Subscription"
Rename sidebar label to **"Subscription"**. New content:
- **Current Tier card**: big tier badge (Basic/Verified/Featured) + benefits list of current tier + "active since" date
- **Upgrade section** (only if not Featured): Same upgrade request form (already exists) → upgrade to next tier
- **Cancel Premium section** (only if Verified or Featured): 
  - Button "Cancel Premium" → opens dialog with form:
    - Reason dropdown (Too expensive / Not getting value / Switching service / Other)
    - Optional comment textarea
    - Cancellation date preference (immediate / end of billing period)
  - On submit → INSERT into `support_messages` with `subject = "[Cancellation Request] {tier}"`, sender_role, full form data in message → admin gets notification automatically (existing trigger fires)
  - Toast: "Cancellation request received. Our team will reach out within 24 hours to confirm."

### 4. Repurpose / clarify "My Listing"
Currently empty. Two options:
- **(a)** Keep it → make it the **profile editor** (description, pros, cons, regulation, platforms, support contacts, logo) — moves the giant edit dialog out of Dashboard into its own page. Locked for Basic with upgrade CTA.
- **(b)** Remove it entirely if Dashboard already has edit dialog.

**Recommend (a)** — cleaner UX, dedicated editing page, Dashboard stays read-only metrics + reviews.

### 5. Mirror to Signal & Betting portals
Same Subscription + My Listing pages for `/portal/signal` and `/portal/betting`.

## Files to Touch
- 1 SQL migration → trigger to keep `is_verified`/`is_featured` in sync with `tier` on all 3 profile tables
- `src/pages/admin/BrokerDashboard.tsx` — fix gating logic, simplify (remove giant edit dialog)
- `src/pages/admin/SignalDashboard.tsx` — fix gating logic
- `src/pages/admin/SportsDashboard.tsx` — fix gating logic
- `src/components/portal/ProviderSidebar.tsx` — rename "Upgrade Tier" → "Subscription"
- `src/pages/portal/BrokerListing.tsx` (new) — full edit page (Verified+ only, locked banner for Basic)
- `src/pages/portal/Subscription.tsx` (new) — current tier + upgrade + cancel form (reused for all 3 portals via prop)
- `src/components/portal/CancelPremiumDialog.tsx` (new) — cancellation form dialog
- `src/App.tsx` — wire new routes

## Out of Scope
- Auto-billing / refund processing (manual handling by admin)
- Partial-month proration
- Admin UI to approve/reject cancellation (admin can use existing Support inbox)
- Editing tier benefits content (hardcoded per tier)

## Open Questions
1. **"My Listing"**: dedicated edit page (recommended) OR remove sidebar item and keep edit dialog inside Dashboard?
2. **Cancellation effect**: After admin approves cancellation → tier auto-drops to Basic, OR admin manually changes tier in admin panel? — *Recommend: admin manual (gives admin chance to retain customer)*

