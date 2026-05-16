## Problem
Compare table-er multiple broker columns side-by-side thakle kar info konta bujha kothin — visual separation nei.

## Fix
`src/pages/Compare.tsx` table-e column-er majhe vertical divider add korbo + hover highlight, jate prottek broker column clearly alada dekha jay.

### Changes in `Compare.tsx`

1. **Header `<th>` (broker columns)** — add `border-l border-primary/15` to each broker column header (skip first "Feature" column).
2. **Body `<td>` (broker cells)** — same `border-l border-primary/15` on each broker cell.
3. **Column hover highlight** — wrap each broker column with a subtle hover state via `group/col` so hovering a column gently highlights it (`hover:bg-primary/5`).
4. **Header bottom border emphasis** — slightly thicker `border-b-2 border-primary/30` on header row for clearer header/body separation.
5. **Feature column tint** — keep the sticky "Feature" column with a slightly different bg (`bg-card/80`) so it reads as a distinct label column vs data columns.

No logic changes, no schema changes — purely visual dividers in the existing table markup.
