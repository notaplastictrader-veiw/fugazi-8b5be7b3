## Goal

Make the **Deposits & Withdrawals** table fully editable from the admin panel. Right now method names come from `payment_methods` (string array) but Min / Processing / Fee columns are hardcoded dashes — so the table looks empty. We need per-row data stored in DB.

## DB change — `public.brokers`

Add one new jsonb column (additive, nullable, no breaking changes):

| Column | Type | Default | Shape |
|---|---|---|---|
| `payment_method_details` | jsonb | `'[]'::jsonb` | `[{ method, min, processing, fee }]` |

The old `payment_methods` text[] column stays as-is (still used elsewhere as a quick tag list). The new jsonb is what drives the table.

## Admin form — `src/pages/admin/BrokersAdmin.tsx`

Add a new editor block in the broker modal called **Payment Method Details** (sits right after the existing Account Types editor since the UX is identical):

- Repeater rows with 4 inputs per row: Method, Min, Processing, Fee
- "Add row" button + per-row delete (✕)
- Wire into `Broker` interface, `emptyBroker`, `openEdit`, and the save `payload`

## Public page — `src/pages/BrokerDetail.tsx`

Replace the current table-body logic (lines 661–675) with a 3-tier fallback:

1. If `broker.payment_method_details` has entries → render those rows as-is (full Min/Processing/Fee data).
2. Else if `broker.payment_methods` has entries → render method names with `—` placeholders (current behaviour).
3. Else → render the existing hardcoded sample rows.

Also extend the `Broker` interface with `payment_method_details?: { method: string; min: string; processing: string; fee: string }[]`.

## Files touched

- New migration: 1 jsonb column on `public.brokers`
- `src/pages/admin/BrokersAdmin.tsx` — interface, form state, modal repeater, save payload
- `src/pages/BrokerDetail.tsx` — interface + table body fallback logic

## Out of scope

- Removing/migrating the legacy `payment_methods` array (kept for backwards compat)
- Changing the Withdrawal Time / Fee cards below the table (already DB-driven)
