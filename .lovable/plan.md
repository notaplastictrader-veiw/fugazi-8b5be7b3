

# Fix Compare Page Refresh Bug + Tint Audit

## Problem 1: Compare Page — Broker Select Causes Page "Refresh"
`addBroker` calls `updateUrl` → `setSearchParams` → URL changes → second `useEffect` (line 39-45) fires → re-sets `selected` from URL → triggers re-render. This creates a loop that resets the Select component, making it feel like a page refresh.

**Fix**: Remove the circular dependency. Use a ref flag to skip the URL-sync effect when the change originated from user interaction, OR simplify by only syncing from URL on initial load (not on every `searchParams` change).

**File: `src/pages/Compare.tsx`**
- Add `useRef` initialized flag
- Second `useEffect` only runs sync on initial load (when `allBrokers` first loads), not on every `searchParams` change
- Remove `searchParams` from dependency array, use a separate initial-load pattern

## Problem 2: Missing Tint on Some Cards
The `.glass-card` CSS already has primary tint. But some elements on About and other pages may use `bg-muted`, `bg-card`, or plain backgrounds without `glass-card`. Will audit About page elements:
- Line 88: `bg-muted` on team avatars — not a card, fine as-is
- The story card (line 35), values cards (line 67), team card (line 80) all use `glass-card` — these should already be tinted

Will increase the tint intensity slightly so it's more visible: change `hsl(var(--primary) / 0.04)` to `hsl(var(--primary) / 0.08)` and card opacity from `0.65` to `0.7`.

## Changes

### 1. Fix Compare page circular re-render
**File: `src/pages/Compare.tsx`**
- Use a `useRef` to track if initial URL sync is done
- Only sync `selected` from URL params on first load (when brokers data arrives)
- After that, user interactions drive `selected` state directly without URL-triggered re-sync

### 2. Increase glass-card tint visibility
**File: `src/index.css`**
- Bump primary gradient stop from `0.04` to `0.08`
- Bump card opacity from `0.65` to `0.7`
- Increase box-shadow from `0.06` to `0.10`

### Files Modified
- `src/pages/Compare.tsx` — Fix circular useEffect loop
- `src/index.css` — Stronger glass-card tint

