

## What you're asking
Auto-detect potential scam brokers based on bad reviews + complaints, queue them for super admin double-check (approve → publishes a scam alert with broker linked, reject → dismisses), and seed + test the whole flow with Quotex.

## Plan

### A. Detection logic (DB function + trigger)

Create a SQL function `detect_potential_scam(broker_id)` that flags a broker when ANY of:
- ≥ 3 published complaints, OR
- ≥ 5 published reviews with `rating ≤ 2`, OR
- average rating < 2.0 with ≥ 5 reviews

When triggered:
1. Insert a row into `scam_alerts` with `status='draft'`, `broker_id` set, auto-generated title (`"Auto-detected: {broker name}"`), description summarizing the trigger ("3 complaints, avg rating 1.8"), `severity='high'`, `created_by=NULL` (system).
2. Insert into `approval_queue` with `content_type='scam_alert_auto'`, `content_id=<new alert id>`, `priority=1`, `reviewer_notes='Auto-detected — needs admin verification'`.
3. Notify all super_admins via `notifications` table with title "🚨 Auto-detected scam: {broker}" linking to `/admin/approvals`.
4. Guard against duplicates: skip if a draft/pending auto-alert already exists for that broker in the last 30 days.

Attach this as an AFTER INSERT/UPDATE trigger on both `reviews` and `complaints` (only fires when status changes to `published`).

### B. Admin approval flow

`ApprovalQueueAdmin.tsx`:
- Add handler for `content_type = 'scam_alert_auto'`: render a special card showing broker name, trigger reason, complaint/review counts, "View Broker" link, plus an editable severity dropdown and editable description before approval.
- **Approve** → flip `scam_alerts.status` to `'published'`, mark queue row `approved`, notify the broker (no-op if no claimed_by) and log to audit.
- **Reject** → flip `scam_alerts.status` to `'rejected'` (or delete), mark queue row `rejected` with reason, log to audit.

### C. Seeding + testing Quotex

1. Find existing Quotex broker row (or insert if missing — currently uncertain, will check).
2. Seed enough triggering data: 3 complaints + 5 low-rating reviews tied to `broker_id = quotex.id`, all `status='published'`.
3. The trigger fires automatically → a draft scam alert appears in `/admin/approvals`.
4. Verify in admin queue that:
   - Quotex auto-detected alert is visible
   - Super admin notification was created
   - On Approve, the alert appears on `/scam-alerts` AND on Quotex's broker profile (already wired in previous step)

### D. Files touched
- 1 SQL migration: `detect_potential_scam()` function + triggers on `reviews` + `complaints`
- 1 data insert: Quotex complaints + low reviews (test data)
- `src/pages/admin/ApprovalQueueAdmin.tsx` — handle `scam_alert_auto` content_type with custom card + approve/reject

### Out of scope
- Email notifications (in-app notification only)
- Configurable thresholds in admin UI (hardcoded for now: 3 complaints / 5 low reviews / avg <2)
- Auto-publishing without admin review (always requires double-check, by design)
- Removing alerts when broker improves (manual admin action)

