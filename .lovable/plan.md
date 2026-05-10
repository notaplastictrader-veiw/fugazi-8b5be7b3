## Plan: Calendar API সরিয়ে শুধু DB-driven weekly news

### লক্ষ্য
JBlanked API (credits শেষ, 401 error) পুরোপুরি সরিয়ে দেয়া। "This Week's Important News" card শুধু `calendar_events` table থেকে ডেটা দেখাবে — admin panel থেকে আপনি/আমি weekly events add করব।

### কী কী পরিবর্তন হবে

**1. Edge function delete**
- `supabase/functions/get-economic-calendar/` — পুরো folder মুছে ফেলা হবে
- Supabase থেকেও deploy uninstall করা হবে

**2. Hook simplify (`src/hooks/useEconomicCalendar.ts`)**
- API call সরিয়ে শুধু `calendar_events` table থেকে published events fetch
- Stale/error states সরানো (আর দরকার নেই)
- Realtime subscribe করা যাতে admin add করলে সাথে সাথে update হয়

**3. WeekNewsBoard (`src/components/calendar/WeekNewsBoard.tsx`)**
- Duplicate fetch logic সরানো — শুধু hook ব্যবহার করবে
- "Showing cached data" warning সরানো
- খালি দিনে "—" placeholder থাকবে (already আছে)

**4. HomepageCalendarWidget (`src/components/sections/HomepageCalendarWidget.tsx`)**
- একই hook ব্যবহার করবে, কোনো structural পরিবর্তন নেই
- যদি আজকের কোনো high-impact event না থাকে, section hidden থাকবে (already আছে)

**5. Calendar page (`src/pages/Calendar.tsx`)**
- Stale banner / API error message সরানো
- Empty state: "No events scheduled — check back soon"

### Admin workflow (আপনার জন্য)
- `/admin/calendar` page-এ গিয়ে প্রতি সপ্তাহে events add করবেন:
  - Title, Date, Time (UTC), Currency, Impact (high/medium), Forecast, Previous, Actual
  - Status = `published` দিলে homepage + calendar page-এ দেখাবে
- অথবা আপনি আমাকে info দিলে আমি database-এ direct insert করে দিব

### যা delete হবে
- `JBLANKED_API_KEY` secret আর দরকার নেই (চাইলে রাখা যাবে, future-এ অন্য purpose-এ লাগতে পারে)
- API fetching, caching logic, stale detection — সব gone

### Risk / Notes
- পুরোপুরি admin-curated হলে data freshness আপনার উপর dependent
- কোনো week-এ events add না করলে card-টা empty দেখাবে ("—")
- Confirm করলে implement শুরু করি
