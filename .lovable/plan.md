

## Goal
Broker / Signal / Betting portal-এ **3-tier system** properly enforce করা — Basic (locked), Verified (unlocked + reply), Featured (verified + homepage placement)। প্রতিটা tier-এর feature gate clearly দেখাতে হবে।

## Tier Matrix

| Feature | Basic | Verified | Featured |
|---|---|---|---|
| View profile + reviews + complaints | ✅ | ✅ | ✅ |
| Basic analytics (total reviews) | ✅ | ✅ | ✅ |
| Edit profile / overview | 🔒 | ✅ | ✅ |
| Reply to reviews | 🔒 | ✅ | ✅ |
| React on reviews (love/care/etc.) | 🔒 | ✅ | ✅ |
| Read/Unread tracking | 🔒 | ✅ | ✅ |
| Verified badge | ❌ | ✅ | ✅ |
| Priority support (Contact Admin) | ✅ | ✅ | ✅ |
| Featured in search results | ❌ | ❌ | ✅ |
| Homepage placement | ❌ | ❌ | ✅ |

## Plan

### 1. Refactor `BrokerDashboard.tsx` with strict gating
- Compute `canEdit`, `canReply`, `canReact`, `isFeatured` from `tier`
- **Basic view**: Edit button + Reply + React → all show 🔒 lock + tooltip "Upgrade to Verified". Card shows a clear "Tier Benefits" banner with what's locked.
- **Verified/Featured view**: Everything unlocked. Featured shows extra "Homepage placement active" note.

### 2. Read/Unread tracking (NEW)
- New table `review_reads (review_id, broker_id, user_id, read_at)`
- RLS: broker owner can insert/select own reads
- UI: each review shows **NEW** badge until broker marks it read; auto-mark when broker replies. Header shows unread count.

### 3. Mirror to Signal & Betting portals
- Apply same gating + Reviews UI to Signal portal and Betting portal dashboards
- Each reads its own profile table for `tier`

### 4. Featured tier homepage placement
- `brokers.show_on_homepage` already exists ✅
- When tier becomes "featured" → automatically set `show_on_homepage = true` (via DB trigger on `broker_profiles` tier change)
- Dashboard shows "Your listing is featured on the homepage" badge

### 5. "Contact Admin" priority support
- Reusable `ContactAdminDialog` component → opens dialog with subject + message
- Saves to `notifications` table addressed to all `super_admin` users (reuse pattern from `notify_admins_on_application`)
- Available to all 3 tiers

### 6. Enhanced Edit dialog (Verified+)
- Expand current edit dialog to include: description, pros, cons, platforms, payment_methods, regulation, headquarters, founded_year, website_url, support email/phone, logo upload
- All edits → submitted to existing approval queue (already wired via `submitToApprovalQueue`)

## Files to Touch
- 1 SQL migration → `review_reads` table + RLS + trigger to sync `show_on_homepage` when tier becomes featured
- `src/pages/admin/BrokerDashboard.tsx` — full tier gating refactor + expanded edit dialog
- `src/pages/admin/SignalDashboard.tsx` — same gating pattern
- Betting portal dashboard file — same gating pattern
- `src/components/portal/TierGate.tsx` (new) — lock overlay + upgrade CTA
- `src/components/portal/ContactAdminDialog.tsx` (new) — priority support modal

## Out of Scope
- Per-feature pricing / subscription billing
- Email notifications (in-app only)
- Rich-text WYSIWYG editor (plain textarea/inputs)
- Per-section read tracking inside one review

## Open Questions
1. **Edit scope for Verified+**: Basic 4 fields (current) OR Full overview (description, pros, cons, platforms, regulation, etc.)? — *Recommend: Full*
2. **Read tracking trigger**: Auto-mark on view OR Manual "Mark as read" button + auto on reply? — *Recommend: Manual + on reply*

