# 🔴 Critical Fixes — Implementation Plan

Three surgical frontend fixes. No backend, no schema, no new deps.

---

## Fix 1 — Rotating eyebrow blank-frame bug

**File:** `src/components/sections/HeroSection.tsx`

**Problem:** Mid-rotation the pill renders empty for ~150ms because the JSX uses a stale variable name and the fade-out sets opacity to 0 before swapping text.

**Approach:**
- Replace the JS-driven opacity toggle with a pure CSS crossfade: render the current item with `key={eyebrowIndex}` and a single `animate-fade-in` class so React re-mounts it cleanly each tick.
- Keep the 3.5s interval, but remove the intermediate "fade out → swap → fade in" two-step. One tick = one mount = one fade-in. No blank frame possible.
- Verify the variable name (`eyebrowItems` / `eyebrowIndex`) matches between state, effect, and JSX.

**Acceptance:** scroll the hero for 30 seconds — pill never goes blank, text always legible.

---

## Fix 2 — Reduce mobile chrome from ~140px to ≤90px above the fold

**Files:**
- `src/components/sections/PromoTicker.tsx` (hide on mobile, or shrink to 24px)
- `src/components/layout/Navbar.tsx` (shrink mobile nav to 48px)
- `src/components/layout/MainLayout.tsx` (recompute `paddingTop` per breakpoint)

**Approach:**
- Hide `PromoTicker` on `<md` (`hidden md:block` on its outer wrapper). Mobile users get the bottom nav for promos via existing CTAs.
- Drop mobile Navbar height from 58px → 48px (logo + hamburger only — already minimal).
- Update `MainLayout` `paddingTop` to `pt-12 md:pt-[92px]` (48px mobile, 92px desktop) instead of the fixed inline 92px.
- Keep desktop unchanged.

**Acceptance:** at 375×812, hero badge + headline first line both visible without scrolling.

---

## Fix 3 — Stop the search typewriter loop

**File:** `src/components/sections/HeroSection.tsx` (search bar block)

**Approach:**
- Replace the typewriter animation on the search input placeholder with a **static rotating placeholder**: pick one of 4 example queries on mount (`useState` with `Math.floor(Math.random()*4)`), no animation, no interval.
- Remove the `setInterval` and per-character state that drives the typewriter.
- Keep the 4 example strings (e.g. "Search Exness", "Compare IC Markets vs Pepperstone", "Is XM regulated?", "Scam alerts this week") so the variety stays.

**Acceptance:** placeholder shows one full example, never animates, never loops. Input remains fully usable; focus clears placeholder as normal.

---

## Out of scope (deferred to 🟠 High batch)
- `loading="lazy"` on broker logos
- Lazy-mounting sections below fold 4
- Per-route `og:image`

## Verification
After edits, reload preview at both 1042×770 (current) and 375×812 (mobile). Confirm:
1. Eyebrow never blanks across 30s
2. Hero headline visible above fold on 375px
3. Search placeholder is static

Estimated diff: ~60 lines across 3 files.
