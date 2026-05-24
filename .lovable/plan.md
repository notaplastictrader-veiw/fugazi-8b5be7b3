## Issues found

**1. 5 ta NAFT Editorial review keno?**
`src/pages/admin/ImportJsonAdmin.tsx` line 80 e import sidecar handler review delete kortese `author_name` column diye — kintu actual `reviews` table column hocche `author`. Tai dedupe delete kono row match kore na, ar prottek import e notun row insert hoye jay. Tomi CMC 4 bar import korecho → 4 ta notun + 1 ta purono = 5 ta.

**2. Rating 4.1 hoileo 5 ta star fully filled keno?**
`src/pages/BrokerDetail.tsx` line 1381 e:
```
i < (r.rating || 0)
```
Rating `4.1` → `i=4 < 4.1` true → 5 ta star fill. Round-down kora uchit chilo.

## Plan

### A. Importer dedupe fix (`src/pages/admin/ImportJsonAdmin.tsx`)
- Line 80 e `author_name` → `author` korbo (review sidecar payload e `author_name` field thakleo, DB column `author`)
- Sidecar payload e `author_name` ele setake `author` e map kore insert korbo, taile schema match thakbe
- Result: shame broker er editorial review re-import e replace hobe, duplicate banabe na

### B. Existing duplicate cleanup
CMC Markets er 4 ta duplicate editorial review (rating 4.1) ache + 1 ta purono (3.6). Latest ta (17:10) rakhbo, baki 3 ta 4.1 + purono 3.6 ta delete korbo. Exness o check kore same cleanup.

### C. Star fill bug fix (`src/pages/BrokerDetail.tsx` line 1381)
`i < (r.rating || 0)` → `i < Math.round(r.rating || 0)` 
(ba half-star support chao kina seta tomar choice — round most natural for review listings)

## Question for you
Star rendering — kon ta chao?
- **Option 1:** `Math.round` — 4.1 → 4 filled, 4.6 → 5 filled (simplest)
- **Option 2:** `Math.floor` — 4.1 → 4 filled, 4.9 → 4 filled (strict)
- **Option 3:** Half-star support — 4.1 → 4 full + empty, 4.5 → 4 full + half (most accurate, but needs new icon logic)

Default e Option 1 korbo jodi tumi na bolo.