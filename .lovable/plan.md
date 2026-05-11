## Goal
Image-er real Forex Factory data (May 11–15, 2026) diye `calendar_events` table refresh kora. Red flag = HIGH impact, Orange flag = MEDIUM impact. Sathe protek event card e ekta "Details" button add kora — click korle modal khulbe je event-er full specs dekhabe (Source, Measures, Usual Effect, Frequency, Next Release, FF Notes, Why Traders Care, Also Called).

## Step 1 — Database refresh

**Delete** age insert kora May 11–15, 2026 events:
```
DELETE FROM calendar_events WHERE event_date BETWEEN '2026-05-11' AND '2026-05-15';
```

**Insert** image-er exact events (time = GMT/UTC, image-e "Etc/UTC GMT+0" diye dewa):

| Date | Time | Cur | Impact | Event | Forecast | Previous | Actual |
|---|---|---|---|---|---|---|---|
| May 11 Mon | 01:30 | CNY | medium | CPI y/y | 0.9% | 1.0% | 1.2% |
| May 11 Mon | 01:30 | CNY | medium | PPI y/y | 1.7% | 0.5% | 2.8% |
| May 12 Tue | 12:30 | USD | high | Core CPI m/m | 0.3% | 0.2% | — |
| May 12 Tue | 12:30 | USD | high | CPI m/m | 0.6% | 0.9% | — |
| May 12 Tue | 12:30 | USD | high | CPI y/y | 3.7% | 3.3% | — |
| May 12 Tue | (Tentative) | USD | high | Fed Chair Nomination Vote | Pass | — | — |
| May 13 Wed | 01:30 | AUD | medium | Wage Price Index q/q | 0.8% | 0.8% | — |
| May 13 Wed | 12:30 | USD | high | Core PPI m/m | 0.3% | 0.1% | — |
| May 13 Wed | 12:30 | USD | high | PPI m/m | 0.5% | 0.5% | — |
| May 14 Thu | 06:00 | GBP | high | GDP m/m | -0.2% | 0.5% | — |
| May 14 Thu | 06:00 | GBP | medium | Prelim GDP q/q | 0.6% | 0.1% | — |
| May 14 Thu | 12:30 | USD | high | Core Retail Sales m/m | 0.6% | 1.9% | — |
| May 14 Thu | 12:30 | USD | high | Retail Sales m/m | 0.6% | 1.7% | — |
| May 14 Thu | 12:30 | USD | medium | Unemployment Claims | 206K | 200K | — |

Each row e `description` field e ekta short event description rakhbo (e.g. "Change in the price of goods purchased by consumers"). All `status='published'`.

## Step 2 — Add "specs" detail field

`calendar_events` table e ekta notun column add korte hobe — `specs jsonb` — jaate per-event detail page-er moto info rakhte pari (Source, Measures, Usual Effect, Frequency, Next Release, FF Notes, Why Traders Care, Also Called). Default `'{}'::jsonb`. Migration tool diye add hobe.

Insert-er shomoy proti event-er specs JSON populate korbo, e.g. Unemployment Claims er jonno:
```json
{
  "source": "Department of Labor (latest release)",
  "measures": "The number of individuals who filed for unemployment insurance for the first time during the past week",
  "usualEffect": "'Actual' less than 'Forecast' is good for currency",
  "frequency": "Released weekly, usually on the first Thursday after the week ends",
  "nextRelease": "May 21, 2026",
  "ffNotes": "This is the nation's earliest economic data...",
  "whyTradersCare": "Although it's generally viewed as a lagging indicator...",
  "alsoCalled": "Jobless Claims, Initial Claims",
  "ffUrl": "https://www.forexfactory.com/calendar"
}
```

Other events-er jonno o similar specs (compact version) populate korbo standard FF descriptions diye.

## Step 3 — UI changes

**`src/hooks/useEconomicCalendar.ts`** — `EconomicCalendarEvent` type e `specs` field add (optional jsonb).

**`src/components/calendar/WeekNewsBoard.tsx`** — proti event card-er nicche ekta chhoto "Details →" button add kora (full card already clickable, but explicit button user-er request anujayi). Click korle existing `EventDetailModal` opens.

**`src/components/calendar/EventDetailModal.tsx`** — current modal e Previous/Forecast/Actual already ache. Tar nicche notun "Specs" section add kora — `event.specs` thakle render korbe ekta clean definition list e:
- Source
- Measures
- Usual Effect
- Frequency
- Next Release
- FF Notes
- Why Traders Care
- Also Called

Footer e existing "View on Forex Factory" link thakbe (specs.ffUrl thakle eta priority pabe).

Styling: glass-card, semantic tokens (bg-secondary/30, border-border, text-muted-foreground for labels, text-foreground for values), font-mono labels — overall aesthetic-er sathe match korbe.

## Out of scope
- Card layout-er bigger redesign na
- Header/branding change na
- Sports/news data unchanged

## Approval needed
- DB migration (add `specs` column) — migration tool diye
- DB data refresh (delete + insert 14 events) — insert tool diye
