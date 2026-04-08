

# Navbar Restructure Plan

## Changes

### 1. Restructure `navLinks` array
- Rename "Betting" → **"Sports"**
- Move "Promotions" and "Share Ideas" into the **"More"** dropdown
- Add new items under "More": **Calendar, News, About Us, Contact Us**
- Move "More" to the **last position** in the nav
- Final nav order: **Broker Reviews, Prop Firms, Sports, Signals, Education, More**

Updated "More" dropdown children:
- Promotions
- Share Ideas
- Calendar
- News
- About Us
- Contact Us
- Become an Affiliate
- IB Partnership
- Collaboration

### 2. Highlight "More" button
- Style the "More" nav item with a distinct look — primary color border/background pill so it stands out from regular nav links

### 3. Logo area — 3-line centered layout
Current: 2 lines (brand name + tagline on one line)
Target:
```
Not A Plastic Trader
Brokers Review
We Test Brokers. You Trade Smarter.
```
- Line 1: Brand name (bold, current style)
- Line 2: "Brokers Review" (small, uppercase, mono)
- Line 3: "We Test Brokers. You Trade Smarter." (smaller, muted)
- All 3 lines centered (`text-center`)

### 4. Responsive checks
- Ensure logo 3-line layout works on desktop (xl), tablet (md), and mobile
- Mobile menu reflects new nav structure with "More" items expandable

## Files Modified
- `src/components/layout/Navbar.tsx` — all changes in this single file

