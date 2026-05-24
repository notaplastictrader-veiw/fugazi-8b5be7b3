## What's done already
- CXM Direct + D Prime imported in v4.8 schema
- 57 brokers remain on v4.7

## Step 1 — Update memory (immediate)
Rename and rewrite `mem://content/broker-review-master-prompt` from v4.7 to **v4.8**:
- Add `hot_take` field spec (2–3 line editorial punch, first-impression decision helper)
- Add `editorial_review_row` sidecar spec (separate insert into `reviews` table with `author='NAFT Editorial'`, `role='editor'`, `verified_account=true`)
- Add FCA / regulator **warning kill-switch fields** (red banner trigger, action label e.g. "AVOID")
- Document the v4.7 → v4.8 diff so old reviews can be upgraded systematically
- Update `mem://features/broker-long-review-schema` to reference v4.8 shape
- Update `mem://index.md` entry text to "v4.8"

## Step 2 — Choose migration strategy for 57 brokers
**Recommended: Tiered hybrid (Option C above).**

| Tier | Count | Approach | Effort |
|---|---|---|---|
| 1 — High-traffic / high-risk | ~15 | You re-research → send JSON | High, but worth it |
| 2 — Tier-1 regulated, stable | ~10 | Light refresh (hot_take + warning check only) | Medium |
| 3 — Long tail | ~32 | Auto-migrate v4.7 shell → v4.8 (empty hot_take) | Zero — script-only |

## Step 3 — Cleanup
- Resolve duplicate: `D Prime` vs `Doo Prime (D Prime)` — delete one
- Decide: `CXM` vs `CXM Trading` — same firm? merge?

## Step 4 — Execution order (after your approval)
1. Memory update (Step 1) — 1 turn
2. Tier 3 auto-migration script — 1 turn, ~32 brokers in one shot
3. You start sending Tier 1 JSONs one-by-one (Exness first?)
4. Tier 2 in parallel as time permits

## Decisions I need from you
1. Approve memory rewrite to v4.8?
2. Approve tiered hybrid (Option C), or do you want all-fresh (A) / all-auto (B)?
3. Tier 1 list above — add/remove anything?
4. Duplicates — which to keep: `d-prime` or `doo-prime-d-prime`? `cxm` or `cxm-trading`?