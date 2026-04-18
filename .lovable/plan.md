

## Issue
User চান `/admin/approvals` page-এর Approval Queue tabs-এ একটা নতুন tab (empty box যেটা mark করা হয়েছে) — যেখানে **Community submissions** (reviews, complaints, trading ideas, submissions) এর pending items দেখা যাবে এবং সেখান থেকেই approve/reject করা যাবে।

## Investigation Plan

### Step 1: Read current approval page
- `src/pages/admin/ApprovalQueueAdmin.tsx` — current tabs (All, Applications, Claims, Upgrades, Content) এবং কিভাবে data fetch হয় বুঝতে হবে
- `src/pages/admin/ReviewsAdmin.tsx`, `ComplaintsAdmin.tsx`, `TradingIdeasAdmin.tsx`, `SubmissionsAdmin.tsx` — কোন tables, কোন status field ব্যবহার করে তা confirm
- `src/components/admin/AdminSidebar.tsx` — sidebar এর Community group structure

### Step 2: Verify in DB
- Count of `pending` items in `reviews`, `complaints`, `trading_ideas`, এবং submissions tables
- Confirm each table has `status='pending'` rows currently

## Proposed Fix

### A. Add new "Community" tab in ApprovalQueueAdmin
নতুন একটা tab button add করব tabs row-তে: **Community** (icon: `MessageSquare` বা `Users`)

### B. Unified pending fetch
`fetchPendingCommunity()` function — Promise.all দিয়ে parallel fetch:
```ts
const [reviews, complaints, ideas, submissions] = await Promise.all([
  supabase.from("reviews").select("id, author, content, rating, broker_id, created_at").eq("status", "pending"),
  supabase.from("complaints").select("id, content, broker_id, user_id, created_at").eq("status", "pending"),
  supabase.from("trading_ideas").select("id, title, content, user_id, created_at").eq("status", "pending"),
  // submissions table — confirm exact name from SubmissionsAdmin.tsx
]);
```
সব merge করে একটা unified `CommunityItem[]` array বানাব with `kind` discriminator ("review" | "complaint" | "idea" | "submission").

### C. Unified row UI
Existing approval-row pattern follow করে (badge for kind, content preview, time-in-queue, approve/reject buttons):
- Approve → `update({ status: "published" })` on the original table
- Reject → `update({ status: "rejected" })` on the original table
- Toast feedback + refetch

### D. Counts on tabs
"Community" tab-এ ছোট badge: total pending count (already shown for other tabs in current design — follow same pattern)

### E. Notifications integration
Approve/reject এর সময় submitter user-কে in-app notification পাঠাব (using existing `notifications` table) যাতে user জানে তার submission accepted/rejected হয়েছে।

## Files to Touch
- `src/pages/admin/ApprovalQueueAdmin.tsx` — add Community tab + fetch + render logic (1 file, main change)
- (Possibly) extract a small `CommunityApprovalRow` sub-component for clean rendering

## Out of Scope
- Drag-and-drop reordering
- Bulk approve/reject (can be a follow-up)
- Inline edit of review/complaint content before approval
- Removing the existing standalone Reviews/Complaints/Submissions admin pages — those stay as full-management screens; this new tab is just for **quick approval triage**

## Question Before Building
Need to confirm:
- "Community" tab-এ কি ৪টা type একসাথে দেখাব (reviews + complaints + ideas + submissions mixed list with filter chips), নাকি Community tab এর ভিতরে আলাদা sub-tabs (Reviews | Complaints | Ideas | Submissions)?

