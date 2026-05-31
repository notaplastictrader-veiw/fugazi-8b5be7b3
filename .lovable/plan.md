## Scope

Address the credibility-critical and high-value issues from the audit. Skip cosmetic z-index tweaks, theme removal (Sentinel is intentional per brand spec), and anything that needs verification before action.

---

## Tier 1 — Credibility & correctness (do first)

1. **Remove fabricated Sports stats** (`src/pages/Sports.tsx`)
  - Delete the `seededHash` / `cumulativeExtra` / `dailySeededWinRate` block.
  - Replace with real values derived only from the DB: `totalPicks = predictions.length`, `settled = predictions.filter(p => p.result).length`, `correct = predictions.filter(p => p.is_correct === true).length`, `winRate = settled > 0 ? round(correct/settled*100) : null`.
  - When `settled === 0`, show "—" with copy "Track record builds as picks settle."
2. **Dedupe `/glossary/:slug` route in `src/App.tsx**`
  - Verify the duplicate first, then remove the second declaration.
3. **Verify Google indexation status** (no code change yet)
  - Use the Google Search Console connector to check coverage for `notafugazitrader.com`.
  - If Cloudflare is blocking Googlebot, the fix is in the user's Cloudflare dashboard (not code) — report findings and instructions back.

---

## Tier 2 — UX polish

4. **Skeleton loaders for listing pages**
  - Add proper skeleton grids during initial fetch on `src/pages/Brokers.tsx`, `src/pages/PropFirms.tsx`, `src/pages/Signals.tsx`. Reuse `@/components/ui/skeleton` matching the existing card aspect ratio.
5. **Broker Detail breadcrumb uses real name**
  - In `src/components/layout/MainLayout.tsx` (or wherever breadcrumbs are auto-generated), allow the page to override the last crumb. Pass the broker's display name from `BrokerDetail.tsx` once loaded.
6. **Hide empty footer social icons** (`src/components/layout/Footer.tsx`)
  - Render each social link only when its URL is non-empty and not `"#"`.
7. **Navbar logo `loading="eager"**`
  - Above-fold; remove `loading="lazy"`.

---

## Tier 3 — Conversion

8. **Rotate exit-intent target** (`src/components/ExitIntentModal.tsx`)
  - Pick CTA based on current route: `/brokers*` → `/match`; `/signals*` → Pro/Telegram; `/education*|/news*` → newsletter; default → free account signup.
9. **Trim homepage density** (`src/pages/Index.tsx`)
  - Audit the 15+ lazy sections. Group related ones (e.g. merge `ScamPulseRadar` + `ScamAlertSection` into a single Trust block; combine `ForecastSection` + `CalendarWidget` + `LatestForexNews` into a Markets block) or defer 3–4 sections to a dedicated `/explore` page.
  - This is a refactor — surface options to the user before cutting.

---

## Explicitly NOT doing

- Removing the Sentinel theme (documented brand variant).
- Changing `chunkSizeWarningLimit` (set intentionally last turn).
- Cookie consent z-index reshuffle (no real overlap observed).
- Adding wait-time copy to forum gate (nice-to-have, not a defect).
- Touching `public/sw.js` without first reading it to confirm Kiro's claim.

---

## Technical details

- All edits are frontend/presentation only — no migrations, no edge function changes.
- Sports stats change is a pure UI/derivation refactor; no schema change.
- Breadcrumb override likely needs a small context or prop drilled from page → layout; will pick the minimal pattern after reading `MainLayout.tsx`.
- Homepage trim (step 9) will be presented as 2–3 concrete grouping options before any deletion.

## Order of work

Tier 1 (1 → 2 → 3) in one batch, then Tier 2 (4–7) in parallel, then Tier 3 (8 standalone; 9 pauses for your input on grouping).