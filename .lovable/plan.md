## Problem

"Inter Turku vs HJK" (এবং similar matches) **Upcoming Predictions** এর page 1-এ আটকে আছে অনেকদিন। কারণ:

1. **Substring false-positive**: `isPopularMatch` করে `team.includes("inter")` — এতে "Inter Turku", "Real Salt Lake", "Athletic Bilbao B" সব popular হিসেবে count হয়ে top-pin হয়।
2. **No freshness window**: দূরের future match (5–10 দিন পরে) যতদিন না খেলা হয় ততদিন upcoming list-এ থাকে — daily কিছুই বদলায় না দেখা যায়।
3. **Soonest sort within group**: same popular group-এ যেটা soonest সেটা আগে — কিন্তু একবার "popular" tag লেগে গেলে নতুন real-popular না এলে এটাই top-এ।

## Fixes (frontend only — `src/lib/popularTeams.ts` + small tweak in `Sports.tsx`)

### 1. Whole-word matching, not substring

`isPopularMatch` কে token-based করব:
- Team name কে normalize → split into words/tokens
- Multi-word entry (e.g. "real madrid", "manchester city") কে phrase হিসেবে exact match
- Single-word entry (e.g. "arsenal", "liverpool", "inter", "milan", "real") কে **whole word boundary** match

```text
"Inter Turku" → tokens: ["inter", "turku"]  
  "inter" alone is too generic → only match if also paired with "milan" 
  or move to multi-word phrase "inter milan"
```

Concrete change: ambiguous single tokens (`inter`, `milan`, `real`, `athletic`, `india`) replaced with phrase forms only:
- `"inter"` → remove; keep `"inter milan"`, `"inter miami"`
- `"milan"` → remove; keep `"ac milan"`, `"milan"` only as phrase via word-boundary
- `"real"` → remove; keep `"real madrid"`, `"real sociedad"`, `"real betis"`
- `"athletic"` → keep only `"athletic bilbao"` and `"athletic club"`
- `"india"` (cricket) → keep but match whole-word only (won't hit "Indianapolis")

### 2. Limit "popular" pinning to next 48 hours

Sports.tsx-এ popular grouping line — শুধু সেই popular matches কে top-pin করব যেগুলো **আগামী 48 ঘণ্টার মধ্যে** শুরু হবে। এতে দূরের future popular matches normal date order-এ থাকবে আর প্রতিদিন list naturally rotate হবে।

```text
upcomingPopularSoon = popular AND match_date < now + 48h
upcomingDefault = [...popularSoon, ...rest sorted by date]
```

দূরের popular ম্যাচ rest-এর মধ্যে date order-এ থাকবে — যত দিন কাছাকাছি আসবে তত উপরে উঠবে।

### 3. (Optional polish) Dedup tighter

কোনো ম্যাচ যদি AI feed থেকে প্রতিদিন একই date/time-এ আসতে থাকে কিন্তু DB-তেও থাকে, current dedupe ঠিক আছে — extra change লাগবে না।

## What user will see

- "Inter Turku vs HJK" আর popular section-এ থাকবে না
- Page 1 প্রতিদিন বদলাবে কারণ shortest-time-to-kickoff matches উপরে আসবে
- Real/Barca/Man City type matches তখনই top-pin হবে যখন তারা আগামী 2 দিনের মধ্যে খেলবে

## Out of scope

- Backend / edge function change নয়
- Admin panel / DB schema unchanged
- Latest Results section unchanged
