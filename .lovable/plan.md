## What's shipping

### 1. Cookie consent owns first paint
- `BetaBanner` and `InstallAppPrompt` defer mounting their visible UI until `localStorage.cookie_consent` is set (accept or reject). They also listen for the existing `cookie-consent-changed` event so they appear immediately after the user decides.
- Result: on first visit you see only the cookie modal. After accept/reject, the beta chip (top-left) and Install App pill (bottom-right) fade in. The "+" FAB is unaffected since it's the primary action.

### 2. PromoTicker: dead links + left-edge clipping
- Every ticker item is currently `<a href="#">` — replace with `<Link to="/promotions">` (also for the sponsored items where no specific URL exists).
- Add a left-edge fade mask (`mask-image` linear gradient) so the marquee doesn't visually "clip" mid-word at the viewport edge.

### 3. PropFirms silent empty state
- The `try/finally` in `PropFirms.tsx` swallows fetch errors and shows "No prop firms found" indistinguishably from a real empty result. Add an `error` state and a small inline error banner with a retry button so transient failures (the bug I saw on first nav) surface instead of looking like missing content. Apply the same treatment to `Brokers.tsx` and `Signals.tsx` for consistency.

### Out of scope (noted, not shipped)
- `manifest.webmanifest` 401 in preview — Lovable preview gates static manifests behind auth; production behind the project's domain serves it correctly. No code change needed.
- Hero overlap with stats — already addressed by fix #1 (cookie modal will be dismissed before user reaches stats on most sessions).

## Files touched
- `src/components/BetaBanner.tsx` — gate visibility on cookie decision
- `src/components/InstallAppPrompt.tsx` — gate FAB visibility on cookie decision
- `src/components/sections/PromoTicker.tsx` — real links + fade mask
- `src/pages/PropFirms.tsx` — error state + retry
- `src/pages/Brokers.tsx` — error state + retry
- `src/pages/Signals.tsx` — error state + retry

No DB, no backend, no new dependencies.