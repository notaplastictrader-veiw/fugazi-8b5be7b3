

## What the user is asking
"Be a pro user, check the site, try everything, find problems." This is an exploratory QA pass across the live preview — clicking through pages, submitting forms, testing auth flows, admin panels, mobile responsiveness, and reporting all bugs found.

## My approach
This requires the **browser automation tools** which are not available in plan mode. I need user approval to switch to default mode so I can actually drive the preview and verify behavior end-to-end.

## QA Test Plan

I'll act as a real user across these flows and report every issue (bugs, broken UI, missing data, console errors, slow loads, RLS denials, etc.) — no fixes yet, just a full bug report. After approval, you can pick which to fix.

### 1. Public site walkthrough (anonymous)
- Homepage: hero, all 9 sections render, tickers scroll, no console errors
- Brokers list → Broker detail: stars (half-star fix), reviews, photos, lightbox, reactions, replies
- Prop Firms, Scam Alerts, Signals, Sports, Forecasts, News, Calendar, Promotions, Compare, Education, Ideas
- Footer links, language switcher (15 langs), 3 themes (Dark/Light/Sentinel), cookie consent
- Global search (⌘K), Live chat button
- Mobile viewport (375px) — nav drawer, layout, ticker overlap

### 2. Auth flows
- Signup (email + Google), email verification gate
- Login, forgot password, reset password
- Session persistence across reload

### 3. Logged-in user dashboard
- Overview, My Reviews, My Complaints, Watchlist, Profile Settings, Referrals
- Submit a review (with photo) → check it appears in admin approval queue
- Submit a complaint, scam report
- Edit profile, change avatar, privacy toggles
- Notifications bell

### 4. Admin panel (super_admin)
- Dashboard, Approval Queue (review modal: photos + Submitted By block), Users, Brokers, Signals, Reviews
- Approve/reject a review → verify it publishes & broker stars auto-update
- Promotions, News, Calendar, Sports, Scam Alerts, Forecasts, Education, Site Settings
- Audit log, Referral Analytics

### 5. Edge cases
- Network tab: failed requests, 4xx/5xx
- Console: errors, warnings, hydration issues
- RLS denials on insert/update
- Broken images, missing translations, layout shift

## Deliverable
A categorized bug report:
- 🔴 **Critical** — broken functionality, data loss, security
- 🟡 **Major** — UX broken but workable
- 🟢 **Minor** — polish, copy, alignment

Each item: page → action → expected → actual → severity.

## Note
I won't perform destructive actions (deleting users, brokers, etc.) without confirmation. I'll only create test content under your own logged-in account where possible.

## Out of scope (this pass)
- Fixing anything (separate approval per fix)
- Performance profiling / Lighthouse
- Cross-browser (Safari/Firefox) — Chromium only
- External integrations (Telegram links, payment gateways)

