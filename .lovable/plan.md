## Goal
Image-er weekly news events (May 11–15) calendar database-e add kora, jate `/calendar` page-er "This Week's Important News" card-e automatically dekhay. Sathe time label "UTC" theke "GMT" e change kora.

## Events to insert (calendar_events table, all status=published)

All from image, current week Mon May 11 – Fri May 15, 2026:

**MON May 11**
- 15:00 USD — Existing Home Sales (Apr) — high

**TUE May 12**
- 13:30 USD — CPI (MoM) (Apr) — high
- 13:30 USD — CPI (YoY) (Apr) — high
- 13:30 USD — Core CPI (MoM) (Apr) — high
- 18:00 USD — 10-Year Note Auction — medium

**WED May 13**
- 13:30 USD — PPI (MoM) (Apr) — high
- 18:00 USD — 30-Year Bond Auction — medium

**THU May 14**
- 07:00 GBP — GDP (YoY) (Q1) — high
- 07:00 GBP — GDP (MoM) (Mar) — high
- 07:00 GBP — GDP (QoQ) (Q1) — high
- 13:30 USD — Retail Sales (MoM) (Apr) — high
- 13:30 USD — Core Retail Sales (MoM) (Apr) — high
- 13:30 USD — Initial Jobless Claims — high

**FRI May 15** — (image-e khali, kichu add hobe na)

Total: 13 events. Inserted via Supabase insert tool (data change, not schema).

## UI tweak
`src/components/calendar/WeekNewsBoard.tsx` e:
- Header text "*All times are in UTC." → "*All times are in GMT."
- `EventDetailModal` e `timezone="UTC"` → `timezone="GMT"`

(Card design already image-er kachakachi — header, blue/primary day band, time+flag+name card layout shob ache. Tai bigger redesign lagbe na.)

## Out of scope
- Database schema change na
- Card layout redesign na (already match korche)
- "Bull Waves" branding/logo copy na — apnar NAFT logo thakbe