## Phase 2 — Polish & Make It Usable

The Forum + Awards pages are live, but two things are blocking real usage:

1. **More menu doesn't show them** — the navbar reads from `site_settings.navbar` (CMS). When CMS data is present, the hardcoded fallback list is ignored. So users can't reach `/forum` or `/awards` from the menu.
2. **Awards page is empty** — no categories or nominees exist yet, and there's no admin panel to add them.

### What I'll do

**1. Make Forum + Awards always appear in nav**
- Patch `Navbar.tsx` so that even when CMS items are loaded, we **inject** Forum + Awards into the "More" group (or append as top-level if no More group exists), without overwriting the admin's CMS choices for everything else.
- Same fix applied to mobile nav.

**2. Forum admin panel** (`/admin/forum`)
- Table view of all threads with search, category filter
- Toggle pinned / locked, delete spam, soft-moderate replies
- Quick stats: total threads, replies, top categories
- Add link in admin sidebar

**3. Awards admin panel** (`/admin/awards`)
- Manage `award_categories` (create/edit/reorder/activate per year)
- Manage `award_nominees` per category — pick from existing brokers OR enter custom title/logo
- Live vote counts visible
- Add link in admin sidebar

**4. Seed 2026 awards** (data migration)
Six launch categories with 4 nominees each, drawn from existing top-rated published brokers:
- Best Overall Broker 2026
- Best for Beginners
- Best Low-Spread ECN
- Best Crypto Exchange
- Best Customer Support
- Most Trusted (Voted by Community)

So `/awards` looks alive on day one.

### Out of scope (defer)
- Pro paywall (you already chose to skip; pricing $49/mo + $399/yr saved)
- Forum reply threading / nested replies
- Award winners announcement page (post-vote)
- Email notifications for thread replies

### Technical details
- Nav fix: add a `mergeForumAwards(items)` helper inside the `useMemo`. Looks for label match `/more/i` in CMS items and appends; otherwise pushes a new top-level item.
- ForumAdmin: lazy route, uses `forum_threads` + `forum_replies` directly with super_admin RLS already in place.
- AwardsAdmin: lazy route, two-pane layout (categories list left, nominees grid right). Brokers picker uses existing `brokers` table (`status='published'`).
- Seed data via `supabase--insert` after migration is approved (one-time script picking top 4 brokers by `score` for each category).
- No new tables. No new edge functions.

### Files I'll touch
- `src/components/layout/Navbar.tsx` — inject Forum + Awards
- `src/components/admin/AdminSidebar.tsx` — add 2 menu items
- `src/App.tsx` — 2 new lazy admin routes
- `src/pages/admin/ForumAdmin.tsx` — new
- `src/pages/admin/AwardsAdmin.tsx` — new
- One data insert (seed categories + nominees)
