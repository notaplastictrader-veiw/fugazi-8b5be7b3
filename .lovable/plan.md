

# Fix Excessive Gap Between Navbar and Page Content

## Problem
Screenshots এ দেখা যাচ্ছে navbar আর content এর মাঝে অনেক বড় gap। কারণ: MainLayout এ `paddingTop: 92px` (PromoTicker 34px + Navbar 58px) দেওয়া আছে, তার উপরে প্রতিটা page এর first section এ `py-24` (96px) বা `py-20` (80px) padding আছে। Total gap = ~172-188px — অনেক বেশি।

## Solution
প্রতিটা page এর first `<section>` এ `py-24` / `py-20` বদলে `pt-6 pb-24` / `pt-6 pb-20` করবো — top padding কমিয়ে 24px রাখবো যেন navbar থেকে content শুধু ticker-size gap এ start হয়।

## Files to Change (20 pages)

All pages will have their first section's `py-24` → `pt-6 pb-24` or `py-20` → `pt-6 pb-20`:

1. `src/pages/Brokers.tsx` — `py-24` → `pt-6 pb-24`
2. `src/pages/PropFirms.tsx` — `py-24` → `pt-6 pb-24`
3. `src/pages/Education.tsx` — `py-24` → `pt-6 pb-24`
4. `src/pages/ScamAlerts.tsx` — `py-24` → `pt-6 pb-24`
5. `src/pages/Signals.tsx` — `py-24` → `pt-6 pb-24`
6. `src/pages/About.tsx` — `py-24` → `pt-6 pb-24`
7. `src/pages/Ideas.tsx` — `py-24` → `pt-6 pb-24`
8. `src/pages/Advertise.tsx` — `py-24` → `pt-6 pb-24`
9. `src/pages/Partnership.tsx` — `py-24` → `pt-6 pb-24`
10. `src/pages/Terms.tsx` — `py-24` → `pt-6 pb-24`
11. `src/pages/Privacy.tsx` — `py-24` → `pt-6 pb-24`
12. `src/pages/Cookies.tsx` — likely `py-24` → `pt-6 pb-24`
13. `src/pages/Promotions.tsx` — `py-20` → `pt-6 pb-20`
14. `src/pages/Sports.tsx` — `py-20` → `pt-6 pb-20`
15. `src/pages/Calendar.tsx` — `py-20` → `pt-6 pb-20`
16. `src/pages/BrokerDetail.tsx` — `py-20` → `pt-6 pb-20`
17. `src/pages/Forecasts.tsx` — check and fix
18. `src/pages/News.tsx` — check and fix
19. `src/pages/Contact.tsx` — check and fix
20. `src/pages/Compare.tsx` — check and fix

**Note**: Homepage (Index.tsx) uses HeroSection which has its own layout — will check and adjust if needed.

## Result
Navbar থেকে content মাত্র ~24px gap এ শুরু হবে — ঠিক ticker box এর সমান space।

