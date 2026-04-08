

# Remaining Changes

Most of your V3 requirements are already built. Here are the specific gaps:

## 1. Navbar Tagline Update
- Change "Global Trading Hub" (line 88 in Navbar.tsx) to **"We Test Brokers. You Trade Smarter."**
- Rename "Broker Reviews & Partnerships" → **"Broker Reviews"**
- The "More" dropdown with Affiliate/IB/Collaboration already exists as "Partnership" dropdown — rename label from "Partnership" to **"More"**

## 2. Language System
Already implemented with 15 languages + RTL. No changes needed.

## 3. Auth System
Already implemented with phone, country, role selection, under-review flow. No changes needed.

## 4. Terms + Privacy + Cookies
Already implemented with checkbox, cookie banner. No changes needed.

## 5. Join Free Button Logic
Currently the "Join Free" navbar button opens signup modal (correct for non-logged-in). Need to add: when logged in, clicking a "Join Free Telegram" button elsewhere should go directly to Telegram. This is already handled in SignalChannel. No changes needed.

## 6. Hero Section
Already has static placeholder and rotating chips. No changes needed.

## 7. Trust Hub
Already has prop firms subsection, removed BD Friendly, has "View all" links. No changes needed.

## 8. Scam Watch
Already has "View All Scams →" link. No changes needed.

## 9. Signal Channel
Already shows 78%+, crypto payment messaging. No changes needed.

## 10-12. Signal Hub, Forecasts, Reviews
All already updated. No changes needed.

## 13. Broker Promotion Section
Already globalized. No changes needed.

## 14. Dashboard
Basic scaffold exists. No changes needed for now.

---

## Summary — Only 3 small text changes in Navbar.tsx:

1. Line 88: `"Global Trading Hub"` → `"We Test Brokers. You Trade Smarter."`
2. Line 13: `"Broker Reviews & Partnerships"` → `"Broker Reviews"`
3. Line 27: `"Partnership"` → `"More"`

All other items from the list are already implemented.

