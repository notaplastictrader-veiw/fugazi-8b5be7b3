

# Remaining V3 Changes — Implementation Plan

## What's Already Done
- Navigation: 8 nav items with Partnership dropdown (Affiliate, IB, Collaboration) ✅
- Language selector with 15 languages + RTL ✅
- Auth modal with 4-role signup, phone, country, T&C ✅
- Cookie consent banner ✅
- User name display (not email) ✅
- Profiles + Applications tables ✅
- Footer with global positioning + policy links ✅

## What's Still Missing

### 1. Navbar — Rename "Brokers" to "Broker Reviews & Partnerships"
- Update `navLinks[0].label` in Navbar.tsx
- Add "More" dropdown with: Become an Affiliate, IB Partnership, Collaboration (currently under "Partnership" — need a separate "More" dropdown)

### 2. Hero Section Updates
- Change search placeholder to static: "Search brokers, prop firms, signal providers"
- Remove animated `searchHints` cycling
- Remove "South Asia's most trusted" from eyebrow items — make all global
- Replace static chips with 3 rotating chip rows: Top 5 Brokers, Top 5 Prop Firms, Top 5 Crypto — fade every 3s

### 3. Trust Hub — Remove "BD Friendly" Filter + Add Prop Firms
- Remove "BD Friendly" from filters array
- Add "Prop Firms" to filter list
- Add "View all 280+ brokers →" link
- Add separate "Top Verified Prop Firms" subsection below brokers
- Show both "Verified" and "Featured" badges side-by-side on cards

### 4. Scam Watch — Add "View All" Link
- Add "View All Scams →" link at bottom of ScamAlertSection

### 5. Signal Channel — Win Rate + Payment Updates
- Change "72–78%" → "78%+"
- Replace "bKash · Nagad · Stripe" → "Preferred crypto payments. Contact us for better payment methods."
- "Join Free Telegram →" button opens Telegram link directly
- "Apply for Access →" stores data in admin panel (already works via PremiumApplicationModal)

### 6. Forecast Engine — Tab Rename + 3-Per-Category
- Change tabs: "forex", "gold", "crypto", "sports" → "Forex", "Gold, Silver & Commodities", "Crypto"
- Remove "sports" tab
- Ensure exactly 3 cards per category

### 7. Community Reviews — Review Submission Form
- Add "Write a Review" form: Name, Email, MT4/MT5 ID, Proof (optional), Star rating
- All submissions require admin approval (insert with `status: 'pending'`)

### 8. Broker Join Section — Global Copy
- Change "Bangladesh, India, Pakistan, UAE" → "across Asia and beyond" or fully global
- Change "South Asia's fastest-growing" → "the fastest-growing global"
- Add "Promote Your Broker" CTA

### 9. Live Chat Button (New)
- Add floating live chat button (bottom-right, above ticker bar)
- Options: link to Telegram, or a Crisp/Tawk.to-style widget
- Simple implementation: floating button → opens Telegram chat in new tab

### 10. Dashboard Pages (Broker + Signal Provider)
- Placeholder dashboard route at `/dashboard`
- Role-based view: Broker sees traffic/reviews, Signal Provider sees performance
- This is a larger feature — will scaffold basic pages

---

## Files to Modify
- `Navbar.tsx` — rename label, adjust "More" dropdown
- `HeroSection.tsx` — static placeholder, rotating chip rows, global eyebrow
- `BrokerTrustHub.tsx` — remove BD Friendly, add prop firms subsection, badges
- `ScamAlertSection.tsx` — add View All link
- `SignalChannel.tsx` — win rate, payment text, Telegram links
- `ForecastSection.tsx` — rename tabs, remove sports
- `CommunityReviews.tsx` — add review submission form
- `BrokerJoinSection.tsx` — global copy updates
- New: `LiveChatButton.tsx` — floating Telegram chat button
- New: `ReviewSubmissionForm.tsx` — review form component
- `Index.tsx` or `App.tsx` — add live chat button

## Files to Create
- `src/components/LiveChatButton.tsx`
- `src/pages/Dashboard.tsx` (user-facing, not admin)

## Database
- No schema changes needed — reviews table already supports pending status, existing tables cover everything

## Estimated Scope
~12 files modified/created. No migrations needed. Primarily frontend updates.

