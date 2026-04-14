

# Full Implementation Plan — User/Broker/Signal/Betting Profile System + Admin Redesign

This is a massive system spanning 9 parts. I'll break it into **6 implementation rounds**, each deliverable independently.

---

## Round 1: Database Foundation
**Goal**: Create all new tables and extend existing ones.

**Migration 1 — Extend profiles + new tables:**
```sql
-- Add "betting_site" to app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'betting_site';

-- Extend profiles table with new columns
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS username TEXT UNIQUE,
  bio TEXT, trading_style TEXT, experience_level TEXT,
  social_telegram TEXT, social_twitter TEXT,
  is_public BOOLEAN DEFAULT true, show_real_name BOOLEAN DEFAULT true,
  show_country BOOLEAN DEFAULT true, show_complaints BOOLEAN DEFAULT true,
  reputation_score INT DEFAULT 0, reputation_tier TEXT DEFAULT 'New Trader';

-- broker_profiles (tier system, claim flow)
CREATE TABLE broker_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  broker_id UUID REFERENCES brokers(id) ON DELETE CASCADE,
  claimed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  tier TEXT DEFAULT 'basic' CHECK (tier IN ('basic','verified','featured')),
  claim_status TEXT DEFAULT 'unclaimed' CHECK (claim_status IN ('unclaimed','pending','claimed')),
  verification_docs_url TEXT, account_manager_name TEXT, account_manager_contact TEXT,
  is_verified BOOLEAN DEFAULT false, is_featured BOOLEAN DEFAULT false,
  featured_position INT, created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now()
);

-- signal_profiles
CREATE TABLE signal_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  signal_group_id UUID REFERENCES signal_groups(id) ON DELETE CASCADE,
  claimed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  tier TEXT DEFAULT 'basic', claim_status TEXT DEFAULT 'unclaimed',
  verification_docs_url TEXT, is_verified BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false, created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now()
);

-- betting_profiles
CREATE TABLE betting_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_name TEXT NOT NULL, slug TEXT UNIQUE NOT NULL,
  claimed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  tier TEXT DEFAULT 'basic', claim_status TEXT DEFAULT 'unclaimed',
  supported_sports TEXT[], affiliate_url TEXT, verification_docs_url TEXT,
  is_verified BOOLEAN DEFAULT false, is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now()
);

-- profile_claims
CREATE TABLE profile_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_type TEXT NOT NULL, profile_id UUID NOT NULL,
  claimed_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  documents_url TEXT, status TEXT DEFAULT 'pending',
  admin_note TEXT, reviewed_by UUID, created_at TIMESTAMPTZ DEFAULT now(), reviewed_at TIMESTAMPTZ
);

-- tier_upgrades
CREATE TABLE tier_upgrades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_type TEXT NOT NULL, profile_id UUID NOT NULL,
  requested_by UUID REFERENCES auth.users(id) NOT NULL,
  current_tier TEXT, requested_tier TEXT, contact_info JSONB,
  status TEXT DEFAULT 'pending', admin_note TEXT,
  created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now()
);

-- reputation_events
CREATE TABLE reputation_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  event_type TEXT NOT NULL, points_delta INT NOT NULL,
  reference_type TEXT, reference_id UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

**Migration 2 — RLS policies** for all new tables using `has_role()` security definer function.

**Migration 3 — Auto-generate username** trigger on profile creation.

---

## Round 2: Public User Profile Pages
**Goal**: Build `/profile/[username]` pages with tabs.

**Files to create/modify:**
- `src/pages/UserProfile.tsx` — Public profile page with 5 tabs (Overview, Reviews, Complaints, Trading Ideas, About)
- `src/components/profile/ProfileHeader.tsx` — Avatar, name, username, country flag, member since, reputation badge, stats row
- `src/components/profile/ReputationBadge.tsx` — Tier label + score display
- `src/components/profile/ProfileTabs.tsx` — Tab navigation component
- `src/pages/dashboard/ProfileSettings.tsx` — Extend with bio, trading style, social links, privacy toggles, username edit
- `src/App.tsx` — Add `/profile/:username` route
- `src/hooks/useReputation.ts` — Hook to fetch/calculate reputation

**Reputation tier mapping:**
0-20 = New Trader, 21-40 = Active Trader, 41-60 = Trusted Trader, 61-80 = Verified Voice, 81-100 = Top Contributor

---

## Round 3: Broker/Signal/Betting 3-Tier Profile System
**Goal**: Claim flow, tier-specific dashboards, public profile pages.

**Files to create:**
- `src/pages/BrokerClaimProfile.tsx` — Search + claim flow
- `src/components/broker/BrokerTierBadge.tsx` — Basic/Verified/Featured visual badges
- `src/pages/admin/BrokerClaimsAdmin.tsx` — Super admin claim approval page
- `src/pages/admin/TierUpgradesAdmin.tsx` — Super admin tier upgrade processing

**Broker dashboard modifications per tier:**
- **Tier 1 (Basic)**: Overview (read-only stats), My Profile (locked view), Reviews (read-only), Upgrade banner
- **Tier 2 (Verified)**: + Reply to Reviews (→ queue), Promotions (→ queue), Basic Analytics
- **Tier 3 (Featured)**: + Full Profile Edit (→ queue), Full Analytics, Account Manager info, Monthly Reports

**Same pattern for Signal Provider and Betting Site dashboards.**

**New sidebar items per role:**
- `broker` → filtered sidebar based on tier
- `signal_provider` → filtered sidebar based on tier
- `betting_site` → new role, new dashboard

**Route additions:**
- `/admin/claims` — Claim management
- `/admin/tier-upgrades` — Tier upgrade requests

---

## Round 4: Super Admin Dashboard Redesign
**Goal**: Complete overhaul — HUD command center with restructured sidebar.

**AdminSidebar.tsx — Complete rewrite** with collapsible section groups:
- OVERVIEW (Command Center, Approval Queue, Audit Log)
- SITE CONTENT (Homepage Sections sub-items, Global Settings)
- CONTENT MANAGEMENT (Brokers, Prop Firms, Betting Sites, Signals, Forecasts, etc.)
- COMMUNITY (Reviews, Complaints, Trading Ideas, Submissions)
- COMPANY DASHBOARDS (Broker/Signal/Betting/User dashboards)
- PEOPLE (Users & Roles, Applications, Team, Partners)
- ANALYTICS & REVENUE
- SETTINGS (per-entity settings, email templates, legal, API keys)

**Sidebar state persistence**: `localStorage` key for collapsed/expanded sections.

**Dashboard Home — Command Center** (`src/pages/admin/Dashboard.tsx`):
- 4-column stats row (pending approvals, total users, total brokers, revenue)
- 3-column grid: Quick Actions | Approval Queue Preview + Recent Registrations | Health Gauges + Top Brokers

---

## Round 5: Moderator Dashboard — Complete Redesign
**Goal**: Separate component tree from super admin. Blue accent, queue-focused.

**Files to create:**
- `src/pages/admin/ModeratorDashboard.tsx` — Full rewrite with blue accent theme
- `src/components/admin/ModeratorSidebar.tsx` — Separate sidebar (MY QUEUE, BROWSE, MY ACTIVITY)
- `src/components/admin/ModeratorLayout.tsx` — Separate layout wrapper (no shared AdminLayout)

**Dashboard design:**
- Greeting with queue count
- 70% queue cards (type badge, submitter, preview, Approve/Reject/Escalate buttons)
- 30% sidebar: today's stats, weekly stats, escalated items, supervisor contact
- Reject modal with reason dropdown
- Blue accent (`hsl(210, 100%, 50%)`) instead of lime

**Route change**: Moderator role routes through `ModeratorLayout` instead of `AdminLayout`.

---

## Round 6: Approval Queue Enhancement + Priority System
**Goal**: Priority-based queue with 4 levels.

**Extend `approval_queue` table:**
```sql
ALTER TABLE approval_queue ADD COLUMN priority INT DEFAULT 3,
  ADD COLUMN escalated_by UUID, ADD COLUMN escalated_at TIMESTAMPTZ;
```

**Priority mapping:**
- P1 (Urgent, 2h): Scam alerts, broker claims, tier upgrades
- P2 (High, 24h): Applications, profile edits, complaints
- P3 (Normal, 48h): Reviews, broker replies, promotions, flagged ideas
- P4 (Low): Contact forms, bug reports, feature requests

**Queue card enhancements**: Priority color badge, time-in-queue indicator (red if >48h), "Request More Info" button.

---

## Technical Notes

- **No `betting_site` role exists yet** — Migration adds it to `app_role` enum
- **RLS on all new tables** using `has_role()` security definer pattern
- **Username uniqueness** enforced at DB level with CHECK constraint (3-20 chars, `^[a-zA-Z0-9_]+$`)
- **Reputation recalculation** via DB trigger on `reputation_events` insert — updates `profiles.reputation_score`
- **Moderator gets completely separate layout** — no shared `AdminLayout` wrapper
- **Sidebar section collapse state** stored in `localStorage('naft-admin-sidebar-state')`
- **Profile privacy**: `is_public=false` → public page shows "This profile is private"
- **Broker reply flow**: reply → `approval_queue` → admin approves → displayed with "Official Response from [Broker]" label

---

## File Count Estimate

| Round | New Files | Modified Files | Migrations |
|-------|-----------|----------------|------------|
| 1 | 0 | 0 | 3 |
| 2 | 5 | 3 | 0 |
| 3 | 5 | 4 | 0 |
| 4 | 1 | 2 | 0 |
| 5 | 3 | 2 | 0 |
| 6 | 0 | 2 | 1 |

**Total: ~14 new files, ~13 modifications, 4 migrations**

I'll start with **Round 1 (Database Foundation)** upon approval, then proceed through each round sequentially.

