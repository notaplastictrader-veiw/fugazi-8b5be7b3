

# V3 Master Prompt — Full Implementation Plan

This is a large-scale upgrade touching navigation, auth, hero, all homepage sections, new pages, dashboards, i18n scaffolding, and cookie consent. We will break it into **5 batches** for manageability.

---

## Batch 1: Navigation + Auth System + Cookie Consent

### 1.1 — Navbar Overhaul
**Current**: 6 nav items with "More" dropdown, region selector (5 flags), shows email after login.
**Target**: 8 nav items (Brokers mega-menu, Prop Firms, Betting, Signals, Promotions, Partnership dropdown, Education, Share Ideas). Replace region selector with language selector (15 languages with globe icon). Show user's first name + avatar initial after login (not email). Logged-in dropdown: My Profile, My Reviews, My Complaints, Signal Subscriptions, Logout.

- Update `navLinks` array to match V3 spec
- Replace region selector with language selector (localStorage `napt-language`)
- Show `user.user_metadata.full_name` split to first name + avatar circle
- Add logged-in user dropdown menu

### 1.2 — Auth Modal Rebuild
**Current**: Simple login/signup with name, email, password, country dropdown (25 countries).
**Target**: 4-tab signup (User, Signal Provider, Broker, Betting Site) with phone number + country code, T&C checkbox, role-specific fields.

- Full country list (~195 countries) with flag emojis
- Phone number field with auto country code selection
- T&C + Privacy Policy mandatory checkbox with scrollable modal overlays
- Signal Provider tab: adds Telegram link, description, track record fields
- Broker tab: company name, website, regulation, license, contact fields
- Betting Site tab: platform name, website, license, supported countries
- Non-user roles show "under review" message on submit
- Store role-specific applications in `approval_queue` table

### 1.3 — "Join Free" Button Logic
- Not logged in → prompt to create account first
- Logged in → dropdown: "Join Free Telegram" (direct link) or "Apply for Premium Access"

### 1.4 — Cookie Consent Banner
- Bottom bar on first visit with Accept All / Manage Preferences / Reject Non-Essential
- Preferences modal with toggle switches (Essential locked, Analytics, Personalization, Marketing)
- Store in `localStorage('napt-cookie-consent')`

### 1.5 — Database Migration
- Add `phone`, `country_code` columns to a new `profiles` table (auto-created on signup via trigger)
- Add `applications` table for broker/signal/betting signups with role-specific JSONB data

---

## Batch 2: Hero Section + Trust Hub + Scam Watch Updates

### 2.1 — Hero Section Updates
- Static search placeholder: "Search brokers, prop firms, signal providers..." (remove animated cycling)
- Replace single chip row with 3 rotating rows: Top 5 Brokers, Top 5 Prop Firms, Top 5 Crypto — cycling every 3s with fade transition
- Keep stats bar unchanged

### 2.2 — Trust Hub Split
**Current**: Single "Top Verified Brokers" section.
**Target**: Two subsections — Brokers + Prop Firms.

- Subsection A: Brokers with filters (All, Forex, Crypto, Binary, Prop Firms, ECN, Scam Watch) — remove "BD Friendly" filter
- Subsection B: New "Top Verified Prop Firms" with filters (All, Instant Funding, Challenge-based, Crypto Funded, No Time Limit)
- Cards show both Verified + Featured badges side by side
- Add "View all 280+ brokers →" and "View all prop firms →" links

### 2.3 — Scam Watch Update
- Add "View all 61 alerts →" link at bottom

---

## Batch 3: Signal Channel + Signal Hub + Forecasts + Reviews + Broker Section

### 3.1 — Signal Channel Updates
- Change win rate display to "78%+" (from "72-78%")
- Free tier: "Join Free Telegram →" opens Telegram link directly
- Premium tier: two options (application form OR direct Telegram contact)
- Remove bKash/Nagad/Stripe payment references, replace with crypto payment messaging

### 3.2 — Forecast Engine Tab Update
- Change tabs from (forex, gold, crypto, sports) to (Forex, Gold, Silver & Commodities, Crypto)
- Ensure 3 cards per tab with correct pairs per V3 spec

### 3.3 — Community Reviews Enhancement
- Half-star support in star ratings
- Mixed reviewer types: photo, initials avatar, anonymous
- Add review submission form (broker dropdown, star rating, title, body, MT4/MT5 ID, proof upload)
- All submissions go to admin approval queue

### 3.4 — Broker Join Section Updates
- Update subtitle to remove regional bias ("Asia and beyond" → global)
- Add analytics dashboard preview mockup below plan cards
- Update plan card features per V3 spec

---

## Batch 4: i18n Scaffolding + Footer + New Pages

### 4.1 — i18n System
- Create `src/i18n/` with JSON files per language (start with English as source of truth)
- Create `useTranslation` hook and `LanguageProvider` context
- RTL support: Arabic + Urdu trigger `dir="rtl"` on html tag
- Wire up language selector in navbar

### 4.2 — Footer Updates
- Remove "South Asia's most trusted" → global positioning
- Add footer links: Terms & Conditions, Privacy Policy, Cookie Policy, Affiliate Program, Become an IB, Advertise With Us

### 4.3 — Static Pages
- `/terms` — Terms & Conditions
- `/privacy` — Privacy Policy
- `/cookies` — Cookie Policy
- `/contact` — Contact page
- `/partnership` — Affiliate / IB / Collaboration page

---

## Batch 5: Broker & Signal Provider Dashboards

### 5.1 — `/dashboard` Route (role-based)
- Broker dashboard: Overview, Profile Edit, Reviews, Complaints, Promotions, Analytics, Billing, Support
- Signal Provider dashboard: Overview, Profile, Performance, Reviews, Analytics, Billing, Support
- All edits go through admin approval queue
- Analytics panel with charts (profile views, clicks, sentiment)

### 5.2 — Database Changes
- `promotions` table (title, type, value, expiry, terms, banner, status)
- `analytics_events` table (event type, entity_id, metadata, timestamp)

---

## Technical Details

### Files Modified (estimated)
- ~5 existing components heavily modified (Navbar, AuthModal, HeroSection, BrokerTrustHub, BrokerJoinSection, Footer, SignalChannel, ForecastSection, CommunityReviews)
- ~15 new components (cookie banner, language selector, user dropdown, review form, dashboard layouts, static pages)
- ~3 database migrations (profiles table, applications table, promotions table)
- ~15 i18n JSON files (one per language, English only filled initially)

### Priority Order
Batch 1 first (navigation + auth + cookie consent), then Batch 2 (hero + trust hub), then Batch 3 (content sections), then Batch 4 (i18n + pages), then Batch 5 (dashboards).

I recommend we start with **Batch 1** — the navigation, auth modal rebuild, and cookie consent system. This is the foundation everything else depends on.

