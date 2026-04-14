

# Plan: Futuristic HUD Dashboard Ecosystem

This is a large-scale project. I recommend implementing it in 3 phases to keep things manageable. Here's the full plan — we'll start with Phase 1.

---

## Phase 1: Role-Based Dashboard Routing + HUD Styling (implement now)

### 1A. Role-aware /admin landing
Currently all roles see the same Dashboard page. Change so:
- **super_admin** → Super Admin HUD Dashboard (full CMS + stats)
- **broker** → Broker-only Dashboard (their listing, complaints, reviews)
- **signal_provider** → Signal-only Dashboard (their group stats)
- **content_ops / moderator** → Content Ops Dashboard (approval queue focus)

**How:** Modify `src/pages/admin/Dashboard.tsx` to check roles and render the appropriate dashboard component, OR create a `DashboardRouter.tsx` that conditionally renders based on role.

### 1B. Futuristic HUD visual overhaul
Apply to all admin pages:
- New CSS classes: `hud-card` (dark bg, glowing cyan/lime border on hover, subtle scan-line overlay), `hud-stat` (radial gradient bg, animated border pulse)
- Update `AdminLayout.tsx` header with HUD styling — gradient top bar, subtle grid background
- Stat cards get circular progress indicators or gauge-style displays
- Color scheme: cyan (`#00E5FF`), lime (`hsl(var(--primary))`), dark charcoal backgrounds with 1px glowing borders

### 1C. Super Admin Dashboard redesign
Replace current basic card grid with:
- Top row: 8 HUD stat gauges (brokers, signals, forecasts, reviews, complaints, scam alerts, pending, users)
- Middle: Live activity feed (approval queue) + system health indicators
- Bottom: Quick action grid with glowing icon buttons
- All with animated borders and subtle pulse effects

---

## Phase 2: CMS Site Content Editor (next iteration)

### 2A. New route: `/admin/site-content`
A page listing all 15 homepage sections as editable cards:
- PromoTicker, Navbar items, Hero (texts, stats, chip groups), BrokerTrustHub (broker cards, prop firm tags), ScamAlertSection, SignalChannel, SignalHub, ForecastSection, HowItWorks, CommunityReviews, BrokerJoinSection, Footer

### 2B. Per-section editor pages
Each section gets `/admin/site-content/:section` with:
- Rich text editing for headings/descriptions
- Image upload for logos/backgrounds
- Add/remove/reorder list items (e.g., promo ticker messages, broker cards)
- Live preview toggle
- All saves go to `site_settings` table with section-specific keys

### 2C. Sidebar update
Add "Site Content" item under super_admin section in `AdminSidebar.tsx`

---

## Phase 3: Company Dashboard Sub-pages (next iteration)

### 3A. Broker Dashboards listing
`/admin/broker-dashboards` — Lists all brokers from DB with search, each row has "View Dashboard" button → `/admin/broker-dashboards/:id` showing that broker's stats, reviews, complaints, edit form

### 3B. Signal Dashboards listing
Same pattern: `/admin/signal-dashboards` → `/admin/signal-dashboards/:id`

### 3C. Betting Site Dashboards
Same pattern for betting/sports sites

### 3D. User Dashboards listing
`/admin/user-dashboards` → `/admin/user-dashboards/:id` with user's activity, reviews, complaints, role management

---

## Phase 1 — Files to create/modify

| File | Action |
|------|--------|
| `src/index.css` | Add HUD CSS classes (hud-card, hud-stat, scan-line overlay, glow animations) |
| `src/pages/admin/Dashboard.tsx` | Complete rewrite — role-aware routing + HUD-styled super admin dashboard |
| `src/components/admin/AdminLayout.tsx` | HUD header styling, grid background |
| `src/components/admin/AdminSidebar.tsx` | HUD styling, grouped sections |
| `src/pages/admin/BrokerDashboard.tsx` | HUD visual upgrade for broker-role users |
| `src/pages/admin/SignalDashboard.tsx` | HUD visual upgrade for signal provider users |

### New HUD CSS additions
```text
.hud-card     → dark bg, 1px cyan/lime border, glow on hover
.hud-stat     → radial gradient, animated pulse border
.hud-scanline → subtle animated horizontal scan line overlay
.hud-glow     → box-shadow glow effect (cyan or lime based on theme)
```

### Technical notes
- Roles come from `useUserRole()` hook — already supports all 6 roles
- The `ProtectedAdminRoute` already handles access control — dashboard routing is additive
- All edits from broker/signal dashboards already go through approval queue
- HUD styling will be scoped to admin pages via CSS classes, won't affect public site

