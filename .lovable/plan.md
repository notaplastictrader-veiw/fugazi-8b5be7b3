

# UI/Content Fixes Plan

## 1. PromoTicker — "PROMOTIONS" Highlight
- Change the "Promotions" label to have a **solid primary background with black text** (like the search button style), remove the border/pulse/transparent bg
- File: `PromoTicker.tsx` line 32

## 2. Navbar — "Trader" text white
- Change `<span className="text-primary">Trader</span>` to `text-foreground` (white in dark theme)
- File: `Navbar.tsx` line 90

## 3. BrokerTrustHub — Prop Firm names listed
- Add 6 static prop firm names as chips/list above the prop firm cards: "Bullwaves Prime", "FTMO", etc.
- File: `BrokerTrustHub.tsx` around line 172-177

## 4. BrokerTrustHub — "View all brokers" text
- Change `"View all 280+ brokers →"` to `"View All Brokers →"`
- File: `BrokerTrustHub.tsx` line 168

## 5. ScamAlertSection — Remove "61+"
- Change `"View all 61+ scam alerts →"` to `"View All Scam Alerts →"`
- File: `ScamAlertSection.tsx` line 64

## 6. SignalChannel — Win rate text
- Change `"78%+"` display to `"~78%"` or `"around 78%"`
- Change line 28: `"→ 78%+ win rate"` to `"→ Around 78% win rate"`
- Change line 60 big display from `"78%+"` to `"~78%"`
- File: `SignalChannel.tsx` lines 28, 60

## 7. SignalChannel — Payment line
- Replace line 30 `"→ Preferred crypto payments..."` with something like `"→ Multiple payment options available. DM us for details."`
- File: `SignalChannel.tsx` line 30

## 8. Country Dropdown styling fix (AuthModal)
- The country `<select>` dropdown (line 284) uses native browser select which renders with white bg and invisible text in light theme. Fix by adding explicit bg/text colors: `bg-card text-foreground` and style `<option>` elements with `className="bg-card text-foreground"`
- File: `AuthModal.tsx` line 284-288

## 9. ForecastSection — Rename tabs + assets
- Change tab `"Gold, Silver & Commodities"` to `"Metal (GOLD)"`
- Expected assets under metal: Gold (XAU/USD), Silver (XAG/USD), Oil (WTI/USD) — these are data-driven from Supabase, but the tab label needs changing
- Add note: admin needs to add these forecast entries in DB
- File: `ForecastSection.tsx` line 18

## 10. ReviewSubmissionForm — Add broker dropdown + photo upload
- Add a "Choose Broker" dropdown that fetches broker names from Supabase
- Add an optional photo upload field with "Optional" label, gallery-style preview
- File: `ReviewSubmissionForm.tsx`

## 11. Broker Full Review Page — Create `/brokers/:slug`
- New page: `src/pages/BrokerDetail.tsx`
- Fetches single broker by slug from Supabase
- Shows full broker info: name, regulation, scores, spread, leverage, deposits
- Includes "Write a Review" form (reuse ReviewSubmissionForm)
- Includes "Create an Account" CTA button
- Add route `/brokers/:slug` in `App.tsx`
- Update BrokerTrustHub "Full review" link to point to `/brokers/${broker.slug}`

## Files to Modify
- `PromoTicker.tsx` — solid bg highlight
- `Navbar.tsx` — Trader text color
- `BrokerTrustHub.tsx` — prop firm names, view all text
- `ScamAlertSection.tsx` — remove 61+
- `SignalChannel.tsx` — win rate + payment text
- `AuthModal.tsx` — country dropdown styling
- `ForecastSection.tsx` — tab label rename
- `ReviewSubmissionForm.tsx` — broker dropdown + photo upload
- `App.tsx` — add broker detail route

## Files to Create
- `src/pages/BrokerDetail.tsx` — full broker review page with reviews + signup CTA

