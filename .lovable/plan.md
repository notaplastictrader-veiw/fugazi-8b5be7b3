# Restore "broker-style" NAFT Editorial Review row for prop firms

## Diagnosis

The system **already** supports the exact flow you want — same as broker reviews:

- Prop-firm Master Prompt v4.9 emits an **`editorial_review_row`** sidecar (`src/content/prompts/prop-firm-review-v4.9.md` lines 560 / 1027).
- `ImportJsonAdmin` auto-detects `{ editorial_review_row: {...} }` and inserts it into `public.reviews` with `author = "NAFT Editorial"`, `role = "editor"` (`src/pages/admin/ImportJsonAdmin.tsx:56-61`).
- `BrokerDetail` already renders that row with a **"Read Full Review →"** CTA when `author === "NAFT Editorial"` (line 1459).

**Why FTMO shows nothing right now:**

```sql
SELECT count(*) FROM reviews r JOIN brokers b USING (broker_id is wrong — joined on id)
WHERE b.slug = 'ftmo';
-- returns 0
```

The FTMO JSON was imported **without** its `editorial_review_row` sidecar. So the dedicated editorial card never renders, and the only thing the user sees is the header strip I added in the previous turn — which is the wrong fix.

## Fix

### 1. Revert the header-strip overreach in `src/pages/BrokerDetail.tsx`

Restore the Reviews tab header to its original minimal form:

```tsx
<div className="flex items-center justify-between mb-4">
  <h2 className="text-xl font-display font-bold text-foreground">Community Reviews</h2>
  <Button size="sm" onClick={() => setShowReviewForm(!showReviewForm)}>
    Write a Review
  </Button>
</div>
```

Drop the "FOR ACCURATE INFO…" + "VISIT FTMO →" pills from this row — they belong on the editorial card, not the section header.

### 2. Keep the editorial-row CTA upgrade

Keep the change made to the editorial review row itself (line ~1459) where, when the row's author is `"NAFT Editorial"`, the footer renders both:

- `Visit {broker.name} →` (affiliate_url ?? website_url, `rel="sponsored noopener"`)
- `Read Full Review →` (switches to full-review tab)

This is the broker-style behavior you want. It will activate the moment the row exists in the DB.

### 3. Re-import FTMO with the sidecar

Action for you (the user), not a code change:

1. Open the **Admin → Import JSON** page.
2. Paste **two objects** in the same payload, exactly like a broker import:

```json
{
  "broker_payload": { ... full FTMO v4.9 prop-firm payload ... }
}
{
  "editorial_review_row": {
    "broker_slug": "ftmo",
    "author": "NAFT Editorial",
    "role": "editor",
    "rating": 4,
    "content": "150–250 word signed editorial opinion — decision helper, not marketing.",
    "verified_account": true,
    "status": "published"
  }
}
```

The importer routes the sidecar to `public.reviews` automatically. After import, the FTMO Reviews tab will show the NAFT Editorial card with both CTAs — identical to how brokers like CXM / D Prime render today.

### 4. Optional safety net (skipped unless you want it)

We could also render a "placeholder" editorial card on the Reviews tab pulled directly from `long_review.verdict.summary` when **no** editorial row exists in the DB — so a freshly imported prop firm still shows something. Decide if you want this; not part of this plan by default because you specifically asked for the **same flow as brokers**, and brokers also require the sidecar to render.

## Files touched

- `src/pages/BrokerDetail.tsx` — revert header strip only. ~10 lines.

No DB migration, no schema change, no prompt change.
