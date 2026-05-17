# Exness Review Polish — Round 2

Goal: make the review feel calmer to read, more BD-focused, internally consistent (everything = 8/10), and cleaner in the side rail + card chrome. All changes are presentation + JSON content only — no schema work.

---

## 1. Overview tab readability

- **TL;DR block** — drop visual weight. Smaller font, muted foreground, no card border / no primary accent. Reads like a quiet pull-quote, not a banner. More improved readability.
- **Stat row** (`Min deposit / EUR/USD spread / Withdrawals / Max leverage`) — **remove entirely**. Same info already lives in the sidebar broker card, so it's noise here.
- **NAFT Trust Score widget** — change `80/100 Excellent` → `**8/10**` with the word **NAFT** highlighted (primary color, bold). Keep the small "Excellent" label.
- **Hero strip** (`Exness 8/10 · 4.2/5 · Trustpilot 4.7/5 · 27,032`) — highlight **NAFT** label before the 8/10; **remove the Trustpilot highlight styling** (plain muted text). Trustpilot only appears here, nowhere else on the page.
- **Reading time chip** — change `8 min read` → 3-`5 min read` every broker review it shows on.

## 2. Sidebar broker card (sticky right rail)

- Score badge: **8/10** (currently shows 80/100 only: `NAFT 8/10`.
- Category label: `Forex` → `**Forex Broker**`.
- Replace the generic **"Trusted"** pill (used on every card) with **"Not a Fugazi or can be a fugazi"** — our brand voice tag. Apply across all broker cards, not just Exness.
- "Write review / Compare / Visit · Affiliate" buttons currently overflow / wrap awkwardly at this viewport. Tighten: stack vertically below ~1200px, smaller font, single-line truncate.
- Move the **4 quick stats** (min dep, spread, leverage, withdrawal) back into this card, above the CTA buttons — compact 2×2 grid. This is where readers expect them.
- **Broker Health 100/100 "Excellent"** — misleading for a new platform with 0 internal reviews. Options:
  - Show **"Pending — needs community data"** with a neutral grey ring until ≥5 reviews exist, OR
  - Hide the health widget on the card and only show it inside the Scam Score tab.
  - Recommend option A (transparent + still visible).
- **Add a seed admin review** so "0 reviews but stars showing" goes away. Insert one editorial review (author: "NAFT Editorial", rating 4, role: "editor") tied to broker_id via `supabase--insert`. Then the star block makes sense.

## 3. Scrollspy on TOC

The left "On this page" rail in `LongReview.tsx` currently doesn't highlight the active section. Add an `IntersectionObserver` that watches each `<section id>` and toggles an `active` class (primary border-left + primary text) on the matching anchor as the user scrolls.

## 4. Content edits inside the JSON (`long_review`)

Single `supabase--insert` UPDATE on `brokers` for `exness`. Changes:

### a. `at_a_glance.deposit_methods`

From the full list → `["bKash", "Visa/Mastercard", "Skrill", "Crypto (BTC, USDT)"]` — bKash first (only BD local kept, drop Nagad/Rocket per "we said previousely to you that we're not BD-focused, but keep bKash"), Visa/Mastercard merged into one entry and placed second.

### b. Deposits & Withdrawals section table

Replace long list with **4 rows only**, columns: Method | Min Deposit | Processing | Fee.


| Method             | Min | Processing       | Fee                    |
| ------------------ | --- | ---------------- | ---------------------- |
| Local Method       | $10 | Instant          | N/A                    |
| Visa / Mastercard  | $10 | Instant – 30 min | 0% (broker side)       |
| Skrill / Neteller  | $10 | Instant          | 0%                     |
| Crypto (BTC, USDT) | $10 | Instant          | 0% or Network fee only |


### c. `at_a_glance.avg_spread_eurusd`

`~0.7 pips` → `**0 – 0.7 pips (Raw to Standard)**` so the card range reads honestly.

### d. `verdict` — Who is this best/not-for

Expand `best_for` to name 3–4 lead-gen countries:  
Vietnam, Thailand, **"Bangladeshi, Pakistani, Sri Lankan, more asian country and South africa traders — low-deposit accounts, local payment method available,local rails, and Asia-friendly support hours."**  
Keep `not_ideal_for` mostly as is, but add **Australia, UK, EU** explicitly (since `geo.excluded` already lists them).

### e. `verdict.trust_score`

Recompute to **8.0** with a transparent breakdown block (new field `trust_breakdown`) — Regulation 2.0/2.5, Execution 1.8/2.0, Costs 1.7/2.0, Withdrawals 1.5/2.0, Transparency 1.0/1.5 → **8.0/10**. Render as a small bar list under the verdict card so the math is visible.

### f. "Where it works" / Geo section

Trim heavily. Keep:

- One short paragraph: "Exness enforces geo + KYC checks. Restricted in US, Canada, UK, EU, Australia, Malaysia, and sanctioned jurisdictions. Full list on their site."
- Then a **"See full restricted list →"** external link to Exness.
- Remove the long bulleted continent breakdown + citation numbers (`+2`, `1`, `2`).

### g. "Who Should Use Exness — and Who Should Not"

Rewrite as two short cards (already styled via `for[] / not_for[]`) — 3 bullets each, plain language, no repetition of what verdict.best_for already said. Use this section to go deeper (trading style + experience level), not geography.

### h. Trustpilot mention

Currently appears in hero chip + verdict + FAQ + footer. **Keep only the hero chip mention.** Strip from all other sections or maybe in explanation can keep so max 2 place 

### i. `reading_time_minutes`

`8` → 3-`5`.

---

## Technical summary

**Files to edit:**

- `src/components/broker/LongReview.tsx` — mute TL;DR styling, remove 4-stat row, highlight "NAFT" label, change chip to 4 min, add IntersectionObserver scrollspy, render new `trust_breakdown` bars.
- `src/pages/BrokerDetail.tsx` — sidebar card: rework score display (NAFT 8/10), category label, replace "Trusted" → "Not a Fugazi", move 4 stats into card, conditional health widget ("Pending" state when reviews < 5), tighten button stack.
- `src/components/broker/BrokerCard.tsx` (and any list card) — same "Forex Broker" label + "Not a Fugazi" pill globally.
- `src/components/broker/BrokerHealthScore.tsx` — add `pending` state when no community signals.

**Data ops (two `supabase--insert` calls):**

1. `UPDATE brokers SET long_review = <new JSON>, score = 8.0, stars = 4.2 WHERE slug = 'exness'` — applies all content edits in §4.
2. `INSERT INTO reviews (...) VALUES (...)` — one seed editorial review for Exness so stars/review-count aren't orphaned.

**No DB migrations. No new components. No new routes.**

---

## Open question (one)

For the **"Trusted" → "Not a Fugazi"** pill: should this replace it on **every broker card sitewide**, or only on verified/high-trust brokers (and unverified ones show nothing)? Recommend **only on verified brokers** so the phrase keeps meaning.

Tell me yes/no on that and I'll execute the full plan above in one pass.