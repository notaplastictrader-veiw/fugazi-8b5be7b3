

## Issue
Approval queue review modal shows author name (e.g. "IMRDIP") but no way to identify which actual user account submitted it — no email, no link to user profile, no user ID context.

## Context Gathered
- `reviews` table has `user_id` column linking to the submitter
- `profiles` table has `full_name`, `username`, `country`, `avatar_url`, `user_id`
- `author` field on review = display name typed in form (can differ from real account name)
- Need to read `ApprovalQueueAdmin.tsx` to see current review modal

## Plan

### Update Approval Queue Review Modal
File: `src/pages/admin/ApprovalQueueAdmin.tsx`

When opening a `review` type item:
1. Fetch the full review row (already does)
2. **Additionally fetch** the submitter's profile via `reviews.user_id` → `profiles` (select `full_name`, `username`, `avatar_url`, `country`)
3. Also fetch the auth user's email from `auth.users` via existing `admin-users` edge function (or join through profiles if email is stored)

### Display in modal — add "Submitted By" block above the review card:
```
┌─ SUBMITTED BY ─────────────────────────┐
│ [avatar] Real Name (@username)         │
│ 📧 user@email.com   🌍 Country         │
│ 🔗 View Profile →  (links /u/username) │
└────────────────────────────────────────┘
```

If `review.author` ≠ profile name → show small note: *"Posted as: IMRDIP"* so admin sees the discrepancy.

If `user_id` is null (legacy/anon review) → show *"⚠ Anonymous submission (no linked account)"*.

### Files to Touch
- `src/pages/admin/ApprovalQueueAdmin.tsx` — add profile fetch + render submitter block in review modal

### Out of Scope
- Adding submitter info to other content types (broker/scam/etc.) — only review modal
- Editing the review or banning the user from this modal
- Email is only fetched if cheap; if it requires an edge function call per item we'll skip and just show profile name + username + country (clickable to full profile page where admin can see more)

### Decision Needed
Email lookup requires calling the `admin-users` edge function (extra round trip). Profile name + username + country come free from `profiles` table.

**Recommend**: Skip email in modal (avoid extra call). Show name + @username + country + clickable "View Profile" link → admin can click through for full details including email if needed.

