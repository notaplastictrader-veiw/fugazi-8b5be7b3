
Goal: stop the Compare page from flashing/reloading and dropping the first broker when a second broker is added.

Why the current fix still fails:
- `src/pages/Compare.tsx` still mixes 2 sources of truth: local `selected` state and `window.location.search`.
- It also hydrates selection inside the async Supabase fetch, then separately mutates the URL with `window.history.replaceState`.
- If the preview/router treats that query-string change like a navigation/remount, the page can reinitialize from the URL again, causing the blink and the lost first broker.

Plan

1. Refactor `src/pages/Compare.tsx` so the URL is the only source of truth
- Use `useSearchParams` from `react-router-dom`.
- Keep only `allBrokers` in React state.
- Derive the selected brokers from `searchParams.getAll("b")` plus the fetched broker list.
- Preserve selection order by mapping over the `b` params directly, not by filtering the broker array.

2. Remove the brittle sync logic
- Remove `initializedRef`.
- Remove `updateUrl`.
- Remove the effect that writes to `window.history.replaceState`.
- Remove the fetch-time hydration logic that reads `window.location.search` and sets `selected`.
- Replace `addBroker` and `removeBroker` with helpers that update only the `b` query params through `setSearchParams(..., { replace: true })`.
- Preserve unrelated query params like `ref`.

3. Reset the broker selector safely
- Replace `selectKeyRef` with a small state-based reset key, or an equivalent controlled reset pattern.
- Only reset the Select after a successful add.
- Keep duplicate prevention and the max-4 broker limit in the same helper.

4. Verify after implementation
- Hard refresh `/compare`.
- Add broker 1, then 2, 3, and 4.
- Remove one broker, then add another.
- Open a shared URL containing multiple `b` params in a new tab and confirm all selected cards and the comparison table load correctly.
- Confirm the page no longer flashes back to the single-select state.

Files involved
- `src/pages/Compare.tsx`

Technical notes
- This is a stronger fix than the earlier stale-closure patch because it removes the state/URL race entirely.
- The current Footer and TickerBar ref warnings are separate console issues and not the direct cause of this compare bug.
