

# Plan: Multiple UI Improvements

## 1. Prop Firms Page — Remove hardcoded firm names, improve filters
**File:** `src/pages/PropFirms.tsx`
- The page currently fetches from Supabase `brokers` table where `type = "prop-firm"`. If no data exists in DB, it shows "No prop firms found." The filter buttons (All, Instant Funding, Challenge-based, Crypto Funded, No Time Limit) already exist and work correctly.
- No firm names are hardcoded in code — those come from the database. If BullWaves/Prime/FTMO/MyForexFunds appear, they are in Supabase. To remove them, delete those rows from the `brokers` table via Supabase Dashboard.
- The filters are already in place and functional.

## 2. Signal Groups — Add "View All" button + Full Profile/Review pages
**Files:** `src/pages/Signals.tsx`, new `src/pages/SignalGroupDetail.tsx`, `src/App.tsx`
- Add a "View All" link/button on each signal group card (like brokers have "Full review" links).
- Create a new `SignalGroupDetail.tsx` page at `/signals/:slug` with a full profile layout similar to `BrokerDetail.tsx`:
  - Header with name, verified badge, win rate score bar
  - Key facts grid (win rate, monthly signals, avg R:R, track record, members)
  - Pros/cons section, performance chart placeholder
  - Community reviews section with `ReviewSubmissionForm` adapted for signal groups
  - Tabs: Overview, Performance, Reviews
- Add the route `/signals/:id` in `App.tsx`

## 3. Education Page — Add "for Premium" badge next to "LEARN TRADING"
**File:** `src/pages/Education.tsx`
- Change the hero badge from `LEARN TRADING` to `LEARN TRADING` and add a separate "FOR PREMIUM" badge or append text next to it
- Add a smooth scroll-down indicator/arrow pointing to the Premium Courses section below

## 4. Ideas Sidebar — Change "Report an Issue" to "Report and Request" + New Form
**Files:** `src/components/ideas/IdeasSidebar.tsx`, new `src/components/ideas/PrivateReportModal.tsx`, `src/pages/Ideas.tsx`
- Rename "Report an Issue" → "Report and Request"
- Rename "Submit a private report" → "Submit a private report"
- Currently clicking "Submit a private report" opens the same `PostIdeaModal` (trading idea form). Fix this by:
  - Creating a new `PrivateReportModal.tsx` with fields: Category (Bug / Feature Request / Content Suggestion), Title, Description, optional screenshot upload, Submit button
  - Pass a separate `onReportClick` callback from `Ideas.tsx` to `IdeasSidebar` that opens this new modal instead of the trading idea modal

## 5. Signup Form — Add Country Search/Code Selection
**File:** `src/pages/Signup.tsx`
- Add a searchable country/dial code selector field before the email field
- Use the existing `src/data/countries.ts` data (flags, dial codes, country names)
- Implement as a searchable dropdown (type to filter countries by name or code)
- Show flag + country name + dial code in the dropdown
- Store selected country in signup metadata

## Technical Details

### New files:
- `src/pages/SignalGroupDetail.tsx` — Full signal group profile page
- `src/components/ideas/PrivateReportModal.tsx` — Report & Request form modal

### Modified files:
- `src/App.tsx` — Add `/signals/:id` route
- `src/pages/Signals.tsx` — Add "View All" link on cards
- `src/pages/Education.tsx` — Add "FOR PREMIUM" badge
- `src/components/ideas/IdeasSidebar.tsx` — Rename text, separate report click handler
- `src/pages/Ideas.tsx` — Add PrivateReportModal state and pass to sidebar
- `src/pages/Signup.tsx` — Add searchable country selector

