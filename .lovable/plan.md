

# Comprehensive Update Plan

This is a large request covering navbar styling, search box fixes, new listing pages, admin dashboard expansion, footer restructuring, and icon fixes. Here's the breakdown:

---

## 1. Navbar Changes

### 1a. Highlight "Promotions" in the PromoTicker
- In `PromoTicker.tsx`, make the "Promotions" label more prominent — use `text-primary font-bold` with a glow/pulse effect so it stands out as a highlighted element.

### 1b. Remove box styling from "More" pill
- In `Navbar.tsx` line 108, remove `border border-primary/30 rounded-full px-3 hover:bg-primary/10` from the "More" button. Keep only `text-primary font-semibold` so it's highlighted by color only, not boxed.

### 1c. Make the 3-line logo text more distinguishable across themes
- Update lines 89-97 in `Navbar.tsx`:
  - Line 1 "Not A Plastic Trader": keep bold, use `text-foreground`
  - Line 2 "Brokers Review": use `text-primary` instead of `text-muted-foreground` so it pops in all 3 themes
  - Line 3 tagline: use `text-muted-foreground` with slightly larger text (`text-[9px]` instead of `text-[8px]`)

---

## 2. Search Box Font Fix

- In `HeroSection.tsx` line 104, update the placeholder to use styled spans or fix the font — the placeholder text "Search brokers, prop firms, signal providers..." should use a consistent `font-mono` or ensure the placeholder styling matches across browsers. Add `placeholder:font-normal placeholder:tracking-wide` classes.

---

## 3. Trust Hub — Forex-Only Default + Full Broker Pages

### 3a. Default filter to "Forex" for broker cards
- In `BrokerTrustHub.tsx`, keep the "All" filter but ensure the default homepage view only shows forex-type brokers (already does — `b.type !== "prop-firm"` filters non-prop-firms). The filters already work correctly.

### 3b. Create `/brokers` page — All Brokers Full Review
- New file: `src/pages/Brokers.tsx`
- Full listing page with all brokers from Supabase, same filters as Trust Hub, but showing ALL brokers with expanded cards (full review content, more details)
- Add route in `App.tsx`

### 3c. Create `/prop-firms` page — All Prop Firms Full Review
- New file: `src/pages/PropFirms.tsx`
- Same pattern as Brokers page but filtered to `type === "prop-firm"`
- Add route in `App.tsx`

### 3d. Create `/scam-alerts` page — All Scam Alerts
- New file: `src/pages/ScamAlerts.tsx`
- Full listing of all published scam alerts from Supabase
- Add route in `App.tsx`

---

## 4. Navbar "More" Dropdown Restructure

Restructure the "More" dropdown into grouped sections:

```
Main Menu:
  Promotions
  Share Ideas
  News
  Calendar

Partnership (sub-header):
  Become an Affiliate
  IB Partnership
  Collaboration

About Us
Contact Us
```

- Add section dividers/headers within the dropdown in `Navbar.tsx`

---

## 5. Footer Restructure

### 5a. Move "About Us" and "Contact Us" from Company column
- Remove from the Company column
- Place them below the social media icons row as side-by-side links

### 5b. Fix TikTok and X icons
- Replace `Music` (lucide) with a proper TikTok SVG icon
- Replace `Twitter` (lucide) with a proper X logo SVG icon
- Use inline SVGs since lucide doesn't have the updated brand icons

---

## 6. Admin Panel — Role-Based Dashboards

### 6a. Super Admin Dashboard Enhancement
- Enhance `Dashboard.tsx` (admin) with more detailed stats, recent activity feed, quick actions

### 6b. Add Broker Dashboard in Admin
- New admin sub-page: `src/pages/admin/BrokerDashboard.tsx`
- Shows broker-specific analytics: traffic, clicks, leads, review management
- Add route under `/admin/broker-dashboard`

### 6c. Add Signal Provider Dashboard in Admin
- New admin sub-page: `src/pages/admin/SignalDashboard.tsx`
- Shows signal-specific analytics: subscribers, performance, signals sent
- Add route under `/admin/signal-dashboard`

### 6d. Add Sports/Betting Dashboard in Admin
- New admin sub-page: `src/pages/admin/SportsDashboard.tsx`
- Add route under `/admin/sports-dashboard`

### 6e. Add User Dashboard in Admin
- New admin sub-page: `src/pages/admin/UserDashboardAdmin.tsx`
- Shows user management, role assignments, activity logs
- Add route under `/admin/user-dashboard`

### 6f. Update AdminSidebar
- Add all 4 new dashboard links to `AdminSidebar.tsx` under a "Dashboards" group

---

## 7. Backend — Make All "View All" Links Functional

Ensure clicking any link navigates to its page with real data:
- `/brokers` → all brokers
- `/prop-firms` → all prop firms
- `/scam-alerts` → all scam alerts
- `/signals` → signal groups page (create if missing)

---

## Files to Create
- `src/pages/Brokers.tsx`
- `src/pages/PropFirms.tsx`
- `src/pages/ScamAlerts.tsx`
- `src/pages/Signals.tsx`
- `src/pages/admin/BrokerDashboard.tsx`
- `src/pages/admin/SignalDashboard.tsx`
- `src/pages/admin/SportsDashboard.tsx`
- `src/pages/admin/UserDashboardAdmin.tsx`

## Files to Modify
- `src/components/sections/PromoTicker.tsx` — highlight Promotions label
- `src/components/layout/Navbar.tsx` — remove More box, fix logo colors, restructure dropdown
- `src/components/sections/HeroSection.tsx` — fix search placeholder font
- `src/components/layout/Footer.tsx` — move About/Contact, fix TikTok/X icons
- `src/components/admin/AdminSidebar.tsx` — add dashboard links
- `src/pages/admin/Dashboard.tsx` — enhance with more detail
- `src/App.tsx` — add all new routes

## No Database Changes Required
All data already exists in the brokers, scam_alerts, signal_groups tables.

