## Goal

Add the fields you actually want (skip restricted countries / scam score), and fix the broker-detail Trading Conditions table where the "Leverage" header sits above commission values.

## DB changes — `public.brokers`

Add 4 nullable columns (no breaking changes):

| Column | Type | Default | Purpose |
|---|---|---|---|
| `license_number` | text | `''` | e.g. "SD185 (Equitex Capital Ltd)" — shown in Regulation & Safety |
| `withdrawal_time` | text | `''` | e.g. "1–3 days (crypto), 3–5 days (bank)" |
| `withdrawal_fee` | text | `''` | e.g. "Crypto free, Bank $10" |
| `warning_note` | text | `''` | Optional amber alert near "Open Account" CTA |

Also extend the existing `account_types` jsonb shape to include a per-row `leverage` field:
`{ name, min_deposit, spread, leverage, commission }` — purely additive, old rows still work.

## Admin form — `src/pages/admin/BrokersAdmin.tsx`

- Extend `AccountType` interface + `addAccountType` defaults with `leverage`.
- Account Types editor: change grid from 12-col (4 inputs) to add a 5th input "Leverage (1:500)".
- Add new "Risk & Trust Info" section in the modal:
  - License Number (Input)
  - Withdrawal Time (Input)
  - Withdrawal Fee (Input)
  - Warning Note (Textarea)
- Wire all fields into `emptyBroker`, `openEdit`, and `payload`.

## Public broker detail — `src/pages/BrokerDetail.tsx`

1. **Trading Conditions table (line 582–606):** Add a "Commission" column so the table becomes:
   ```
   Account | Min Deposit | Spread | Leverage | Commission
   ```
   - `Leverage` cell → `at.leverage || broker.leverage`
   - `Commission` cell → `at.commission || '—'`
2. **Regulation & Safety section:** show `license_number` row when present.
3. **Funding/Payment Methods section:** show "Withdrawal Time" and "Withdrawal Fee" rows when present.
4. **Sidebar near "Open Account" CTA:** if `warning_note` exists, render an amber alert card with the warning text.
5. Extend `Broker` + `AccountType` interfaces accordingly.

## Files touched

- New migration: 4 columns on `public.brokers`
- `src/pages/admin/BrokersAdmin.tsx` — interface, form state, modal fields, save payload, account-types editor
- `src/pages/BrokerDetail.tsx` — interface, table header/cells, new info rows, optional warning card

## Out of scope

- Restricted countries, scam score (per your request — skipped)
- Filling actual values for Bullwaves (you'll do via admin UI after fields exist)
