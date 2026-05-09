## Goal

Make the broker edit modal **wide, tabbed, and breathable** so editing doesn't feel cramped. Remove the now-unwanted "Risk & Trust Info" block.

## Modal redesign — `src/pages/admin/BrokersAdmin.tsx`

**Size & shell**
- Bump width: `max-w-2xl` → `max-w-5xl` (≈1024px)
- Keep `max-h-[90vh] overflow-y-auto`
- Add a sticky header (title + Save/Cancel) so action buttons are always reachable
- Replace the single long scroll with a **5-tab layout** using existing shadcn `Tabs`

**Tabs and what goes in each**

```text
┌─────────────────────────────────────────────────────────────┐
│ Edit Broker                                  [Cancel][Save] │
├─────────────────────────────────────────────────────────────┤
│ [Basics] [Trading] [Funding] [Display] [Status]             │
├─────────────────────────────────────────────────────────────┤
│  …active tab content…                                       │
└─────────────────────────────────────────────────────────────┘
```

1. **Basics** — Name, Slug, Type, Badge, Description, Founded Year, Headquarters, Logo upload, Tags, Regulation
2. **Trading** — Score, Stars, Avg Spread, Leverage, Min Deposit, Pros, Cons, Platforms, **Account Types** repeater
3. **Funding** — Payment Methods (chip input), **Payment Method Details** repeater (the new Deposits & Withdrawals editor)
4. **Display** — Website URL, Support Email, Support Phone, Show on Homepage toggle + position
5. **Status** — Status dropdown (draft/pending/published/rejected) + Save button (also in sticky header)

**Polish details**
- Inside each tab, group related fields into card-style blocks with thin borders + `p-4` padding so they breathe
- Repeater rows: switch from raw 12-col grid to labeled inputs in 2-col responsive grid (so on narrow screens they stack instead of squeezing into tiny columns) — current 12-col is the main "hijibiji" cause
- Each repeater row gets a small header `#1 Standard Account` with the delete button on the right
- Use `min-h-[52px]` on the repeater "empty state" so it doesn't collapse

## Removals — Risk & Trust Info

Per your request:
- Remove the amber "Risk & Trust Info" section from the modal entirely
- Stop sending `license_number`, `withdrawal_time`, `withdrawal_fee`, `warning_note` in the save payload (they'll just stay as their DB defaults of `''`)
- Drop the matching renders in `src/pages/BrokerDetail.tsx`:
  - License number row inside Regulation & Safety
  - Withdrawal Time / Withdrawal Fee cards under the Deposits table (the new Payment Method Details table already covers fees & processing)
  - Amber Warning Note alert next to "Open Account"
- The DB columns stay (no migration; non-destructive). If you ever want them back, just re-add the inputs.

## Files touched

- `src/pages/admin/BrokersAdmin.tsx` — modal restructure into Tabs, repeater rows polished, Risk & Trust block removed
- `src/pages/BrokerDetail.tsx` — remove the 3 render blocks tied to the removed fields

## Out of scope

- Field-level validation, autosave, or dirty-state warnings
- Database migrations (none needed)
- Touching any other admin page
