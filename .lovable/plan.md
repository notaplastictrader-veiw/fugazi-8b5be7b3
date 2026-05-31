# Final 5 Fixes — Path to 9.0+

## 1. 🔴 CRITICAL — Fix sitemap domain (Google indexation root cause)

`scripts/generate-sitemap.ts` line 7 and the generated `public/sitemap.xml` all point to `https://fugazi.lovable.app` instead of the real production domain `https://www.notafugazitrader.com` (which is already used everywhere in `index.html` canonical/og/JSON-LD tags).

Result: Google sees a sitemap full of `fugazi.lovable.app` URLs that either 404, redirect, or get treated as duplicates of the real domain → none of the dynamic broker/news/promotion pages get indexed.

**Change:**
- `scripts/generate-sitemap.ts` → `BASE_URL = "https://www.notafugazitrader.com"`
- Regenerate `public/sitemap.xml` (happens automatically on next `predev`/`prebuild`, but I'll also rewrite the committed file so it's correct immediately).
- Add `Sitemap: https://www.notafugazitrader.com/sitemap.xml` to `public/robots.txt` if not already there.

## 2. Pro page — add to navigation

`/pro` route exists (`src/pages/Pro.tsx`) but has zero entry points — monetization leak.

**Change:** Add a "Pro" link in `Navbar.tsx` (desktop menu) with a small "New" or sparkle badge. Mobile: add to `MobileBottomNav` or the hamburger drawer (wherever Pricing-style items live).

## 3. InstallAppPrompt — respect dismissed state

`STORAGE_KEY = "naft_install_prompt_dismissed"` is *written* on dismiss but never *read*. The FAB re-appears on every page load even after the user clicks X.

**Change:** In the `useEffect` mount block of `src/components/InstallAppPrompt.tsx`, check `localStorage.getItem(STORAGE_KEY)` before calling `setShowFab(true)`. Optionally add a 7-day TTL so it can re-surface later.

## 4. Newsletter inline CTA on homepage

Newsletter only lives in the footer (low conversion). Add one inline placement on the homepage between two content sections (e.g. after MarketsIntelBlock / before CommunityBlock) using the existing `<NewsletterSignup source="homepage_inline" />` component, wrapped in a glass-card with a short headline like "Get scam alerts before they cost you money."

**Change:** New small section component `src/components/sections/NewsletterInline.tsx` (or inline JSX in `Index.tsx`), uses existing component — no new logic.

## 5. Verify — confirm sitemap regenerates correctly

After editing the script, the regenerated `public/sitemap.xml` should show `notafugazitrader.com` URLs. I'll spot-check the first few lines after the build hook runs.

---

## Technical notes

- No DB / no backend changes.
- No new dependencies.
- All edits are presentation/config only.
- `index.html`, JSON-LD, and SEO component already use `notafugazitrader.com` — sitemap was the lone holdout.

## Post-deploy user actions (cannot be done in code)

After this ships, you should:
1. Resubmit `https://www.notafugazitrader.com/sitemap.xml` in Google Search Console.
2. Use GSC URL Inspection on 2–3 broker pages to request re-indexing.
3. Confirm Cloudflare Bot Fight Mode is OFF and Googlebot is whitelisted (still the other half of the indexation story).

**Estimated impact:** 8.1 → ~8.7 once Google re-crawls the corrected sitemap.
