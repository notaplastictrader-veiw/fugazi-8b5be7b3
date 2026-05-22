## Bug: `/full-review` crash on Giraffe Markets (and any broker with malformed table)

**Error:** `Cannot read properties of undefined (reading 'map')` in `SectionTable` (LongReview.tsx).

**Root cause:** `SectionTable` directly calls `table.headers.map(...)` and `table.rows.map(...)`. If a section's `table` exists but is missing `headers` or `rows` (or rows contain a non-array), it crashes the whole page.

## Fix (1 file)

`src/components/broker/LongReview.tsx` — `SectionTable`:
- Guard: `const headers = Array.isArray(table?.headers) ? table.headers : [];`
- Guard: `const rows = Array.isArray(table?.rows) ? table.rows : [];`
- Guard each row: `Array.isArray(row) ? row : []`
- If both empty → return `null` (skip rendering the table cleanly).

Also wrap the whole sections render with the existing `data.sections || []` fallback (already in place at line 204) — no change needed there.

## Out of scope
- No content changes to any broker's `long_review` JSON.
- No schema changes.
