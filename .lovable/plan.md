## Goal

Bulk-seed the catalog so visitors see the full breadth of NAFT's coverage (590+ entities) today, with deep reviews added later. Each new entry shows only the **name** + an "Upcoming" indicator; all stats stay at zero until real data is added.

## Scope per category

| Category | Target | DB target |
| :--- | ---: | :--- |
| Forex Brokers | 280 | `brokers` (type=`forex`) |
| Prop Firms | 180 | `brokers` (type=`prop-firm`) |
| Crypto Exchanges | 40 | `brokers` (type=`crypto`) |
| Binary Options | 10 | `brokers` (type=`binary`) |
| Signal Providers | 50 | `signal_groups` |
| Sportsbook / Betting | 30 | `betting_sites` |
| **Total** | **590** | |

## Preservation rules

- **Exness** and **Bullwaves** rows: NOT touched (no update, no overwrite).
- Other already-existing names (IC Markets, Pepperstone, FTMO, The5ers, Topstep, Apex Trader Funding, E8 Markets, FundedNext, My Forex Funds, XM Global, Quotex, Bet365, 1xBet, Betway, Stake, 10Cric, 22Bet, etc.): kept as-is. Inserts skipped on case-insensitive name match per category, so existing detail data is not clobbered.

## "Upcoming" treatment

Each new placeholder gets:
- `name`, unique `slug` (kebab-case), correct `type`
- `status = 'published'` (visible immediately)
- `logo_url = ''` (empty)
- `score = 0`, `stars = 0`, `review_count = 0`, `complaints = 0`
- `tags = ['upcoming']`
- `warning_note = 'Coming soon — full review in progress.'` (brokers table)
- `badge = 'none'`
- For `signal_groups` / `betting_sites`: equivalent zero stats + an "upcoming" tag/feature

UI tweak (small, frontend-only): in broker / signal / betting card components, when `tags` includes `upcoming` (or `review_count === 0` and no logo), show a muted **"Upcoming"** chip in the logo slot instead of an empty box. Existing cards already gracefully handle 0 stats, so no other UI work is required.

## Source name lists

The 6 lists provided in your message are used verbatim as the starting set. Where your message ends a row with "+ আরও Nটি নাম" (e.g. "55–280" forex, "56–180" prop, "8–17" / "41–50" signals, "28–30" betting), the list is auto-padded from well-known public sources (ForexBrokers.com, FXStreet, propfirmmatch, trustpilot, top-exchange rankings, etc.) to hit the exact target counts. Duplicates inside your list (e.g. FxPro / FXCM / CMCMarkets / AdmiralMarkets repeating, Bybit/OKX/Coinbase/Kucoin/Binance.US repeats, Betsson/Melbet/Betwinner/22bet repeats) are de-duplicated so each category reaches its true unique count.

## Execution steps

1. **Generate seed SQL** — one big script with `INSERT … SELECT … WHERE NOT EXISTS` guards on `lower(name)` per `type` for `brokers`, and on `lower(name)` for `signal_groups` and `betting_sites`. This guarantees idempotency and keeps Exness/Bullwaves/etc. untouched.
2. **Run via the data-insert tool** (no schema change needed — all columns already exist).
3. **Frontend tweak** — add an "Upcoming" chip in:
   - `src/pages/Brokers.tsx` broker card (logo slot area)
   - `src/pages/Signals.tsx` signal card (or shared component)
   - `src/pages/Sports.tsx` / betting card
   Triggered by `tags?.includes('upcoming')`.
4. **Verification queries** — count per `brokers.type`, `signal_groups`, `betting_sites` after insert; confirm Exness & Bullwaves rows unchanged (compare `updated_at`).

## Technical notes

- Slugs auto-derived: `lower(regexp_replace(name, '[^a-zA-Z0-9]+', '-', 'g'))` with collision suffix if needed.
- Counts are exact targets — totals will balance to 590 even after de-dup, by topping up from public ranking lists.
- No migrations, no RLS changes, no auth changes.
- Homepage stat tiles ("590+ Brokers & Firms" etc.) already match the seeded totals; no copy change needed.

## Out of scope (for later passes)

- Logos, descriptions, regulation arrays, spreads, leverage, payment methods.
- Pulling real broker websites / affiliate URLs.
- Per-broker scam-history audit.

Approve and I'll generate + run the seed SQL and apply the small "Upcoming" chip in the cards.
