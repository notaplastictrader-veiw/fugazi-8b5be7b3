## Goal

Add a **"Verification Pending" disclaimer banner** on every broker, prop firm, and signal/scam/promotion detail page that warns visitors NAFT's data may not be 100% accurate and to cross-check with the company. Give Super Admin a per-entity toggle to mark the entity as "NAFT Verified" — once toggled on, the banner disappears for that entity.

This keeps NAFT in a safe legal zone by default, while letting you stamp entities you've personally fact-checked as verified.

---

## Where the banner shows

By default (verified = false) on:
- `/brokers/:slug` — BrokerDetail.tsx (in the red-circled area on the screenshot, right under the "Verified 1 month ago" chip and above the stats grid)
- `/prop-firms` cards + any future prop firm detail page
- `/signals/:slug` — SignalGroupDetail.tsx
- `/scam-alerts/:slug` — ScamAlertDetail.tsx
- `/promotions/:slug` — PromotionDetail.tsx

On list pages (Brokers, PropFirms, Signals, etc.), no banner per-card — just on the detail page (cards stay clean).

---

## Banner design

Subtle, non-alarming, theme-aware. Sits inline (not modal, not toast):

```text
┌──────────────────────────────────────────────────────────────────┐
│  ⓘ  Heads up — this listing is still being verified by NAFT.    │
│     Some details may not be 100% accurate. Always cross-check    │
│     with the broker directly or other trusted sources.           │
└──────────────────────────────────────────────────────────────────┘
```

- Background: muted amber/accent tint with 1px border (uses `--accent` token, low opacity)
- Icon: lucide `Info` or `ShieldAlert`
- Text in `text-muted-foreground` with one bold lead phrase
- Rounded, full-width of the hero content column
- Mobile: text wraps, icon stays top-left
- Multi-language ready — wired through `t()` from `I18nContext`

---

## Admin verification toggle

### Schema change
Add a single boolean column to each entity table:

```text
brokers.naft_verified            boolean default false
prop_firms.naft_verified         boolean default false   (if/when table exists; else skip)
signal_groups.naft_verified      boolean default false
scam_alerts.naft_verified        boolean default false
promotions.naft_verified         boolean default false
```

Plus optional metadata:
```text
naft_verified_at                 timestamptz null
naft_verified_by                 uuid null    (admin user id)
```

RLS: read-public, write-admin-only (same pattern as existing fields).

### Admin UI
- In `BrokersAdmin.tsx` row actions: a small "Mark as NAFT Verified" toggle (Switch component) — green ✓ when on
- Same toggle in SignalsAdmin, ScamAlertsAdmin, PromotionsAdmin row editors
- Bulk action in toolbar: "Mark selected as Verified"
- Audit log entry written when toggled

### Frontend behavior
- Detail page reads `entity.naft_verified`
- If `true` → hide banner, optionally show small green chip near the title: "✓ NAFT Verified" (mono caps, primary color)
- If `false` → show the disclaimer banner

---

## Files touched

```text
src/components/common/NaftVerificationBanner.tsx   (new — reusable)
src/components/common/NaftVerifiedBadge.tsx        (new — tiny green chip)
src/pages/BrokerDetail.tsx                         (edit — render banner/badge)
src/pages/SignalGroupDetail.tsx                    (edit)
src/pages/ScamAlertDetail.tsx                      (edit)
src/pages/PromotionDetail.tsx                      (edit)
src/pages/PropFirms.tsx                            (edit — banner on detail card area)
src/pages/admin/BrokersAdmin.tsx                   (edit — verified toggle)
src/pages/admin/SignalsAdmin.tsx                   (edit)
src/pages/admin/ScamAlertsAdmin.tsx                (edit)
src/pages/admin/PromotionsAdmin.tsx                (edit)
src/contexts/I18nContext.tsx                       (edit — add 2 strings)
supabase migration                                 (add naft_verified columns)
```

---

## Out of scope

- No global site-wide footer disclaimer change (existing `AffiliateDisclosure` stays as-is)
- No change to News/Calendar/Forecast/Education entities (those are editorial, not company facts)
- No notification when admin verifies (can add later)

---

## QA checklist

- Pepperstone page shows the banner exactly in the red-circled spot
- Toggle on in admin → banner disappears, green "✓ NAFT Verified" chip appears
- Toggle off → banner returns
- Banner is bilingual (renders via t())
- Mobile layout doesn't break
- All existing 17 brokers default to `naft_verified = false` (banner shows)
