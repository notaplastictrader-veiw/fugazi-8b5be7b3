

## Issue
1. **Bullwaves review submitted but not appearing** on broker page
2. **Bullwaves not auto-added to homepage** after upgrade
3. **No admin control** to choose which 6 brokers show on homepage

## Investigation Plan

### Step 1: Read code (no changes)
- `src/pages/BrokerDetail.tsx` — how reviews are fetched/filtered for a broker
- `src/components/ReviewSubmissionForm.tsx` — what status a new review gets
- `src/components/sections/BrokerTrustHub.tsx` (or whichever shows brokers on homepage) — how the 6 homepage brokers are picked
- `src/components/ReviewSubmissionForm.tsx` already known to set `status='pending'` likely

### Step 2: Verify in DB
- Query `reviews` for the bullwaves review → confirm `status` (likely `pending`)
- Query `brokers` for bullwaves → check what determines homepage placement
- Check `site_settings` for any existing `homepage_brokers` key

## Likely Findings
- **Review issue**: New reviews get `status='pending'` and the broker page only shows `status='published'` (per RLS). Super admin must approve in `Reviews` admin → then it appears.
- **Homepage broker issue**: Homepage section probably hard-picks top 6 by `score` or `is_featured`. Bullwaves has `score=0`, so it never qualifies.

## Proposed Fix

### A. Reviews flow clarification
Two options (will ask user which):
1. **Keep moderation** — explain that new reviews need admin approval at `/admin/reviews` (current behavior, safer)
2. **Auto-publish** — change `ReviewSubmissionForm.tsx` to insert with `status='published'` (faster but no spam control)

### B. Homepage brokers — admin-controlled (NEW FEATURE)
1. **DB**: Add `show_on_homepage boolean default false` and `homepage_position integer` columns to `brokers` table (migration)
2. **Admin UI** (`src/pages/admin/BrokersAdmin.tsx`): Add two new fields in the broker edit modal:
   - Toggle: "Show on Homepage"
   - Number input: "Homepage Position (1–6)"
3. **Homepage section** (`src/components/sections/BrokerTrustHub.tsx` or equivalent): Change query to:
   ```ts
   .eq("status", "published")
   .eq("show_on_homepage", true)
   .order("homepage_position", { ascending: true })
   .limit(6)
   ```
4. **Fallback**: If fewer than 6 brokers have the flag, fill remaining slots with top-scored published brokers (so homepage never looks empty).

### C. Bullwaves visibility
After feature ships, super admin can toggle "Show on Homepage" for Bullwaves directly from admin panel.

## Files to Touch
- 1 migration (add 2 columns to `brokers`)
- `src/pages/admin/BrokersAdmin.tsx` — add toggle + position field
- `src/components/sections/BrokerTrustHub.tsx` (or actual homepage broker section) — update query
- `src/integrations/supabase/types.ts` — auto-regenerated

## Out of Scope
- Auto-promotion logic based on score
- Drag-and-drop reordering UI (simple number input only)
- Review auto-approval (will ask user)

## Question Before Building
Need to confirm with user:
- Should new user reviews be **auto-published** or **stay pending for admin approval**?

