## Pre-Deployment Checklist & Fixes

### Critical Fixes (Deploy-blocker)

1. **Sitemap.xml missing legal pages**
   - Add `/terms`, `/privacy`, `/disclaimer`, `/cookies` to `public/sitemap.xml`
   - Update `lastmod` to match page dates (April 2026)

2. **Cookies page inconsistent design**
   - Convert `src/pages/Cookies.tsx` from basic prose layout to the shared `LegalLayout` component
   - Structure into numbered sections (What Are Cookies, Types, Managing, Third-Party, Contact)
   - Use `Cookie` icon, "primary" accent, cross-links footer

3. **React Router v7 console warnings**
   - In `src/main.tsx`, add `future={{ v7_relativeSplatPath: true, v7_startTransition: true }}` to `BrowserRouter`
   - Silences the 2 yellow warnings currently appearing in console

4. **Theme flash on page load (FOUT)**
   - `index.html` hardcodes `data-theme="dark"` — if user saved Light/Sentinel, they see a flash of dark before React hydrates
   - Add a small inline `<script>` in `<head>` before fonts to read `naft-theme` from localStorage and set `data-theme` early

5. **404 page lacks layout wrapper**
   - Wrap `NotFound` in `MainLayout` + `SEO` so the navbar/footer appear and page title is set
   - Keep existing centered content styling

### Polish / Perfection Items

6. **Add Organization JSON-LD to legal pages**
   - Import `organizationSchema` from `JsonLd.tsx` and render `<JsonLd data={organizationSchema} />` on Terms, Privacy, Disclaimer pages for richer search results

7. **Date consistency**
   - Align sitemap `<lastmod>` with page "Last updated" text (currently pages say "April 2026", sitemap says "2026-04-30")

### Files to edit
- `public/sitemap.xml`
- `src/pages/Cookies.tsx`
- `src/main.tsx`
- `index.html`
- `src/pages/NotFound.tsx`
- `src/pages/Terms.tsx`, `src/pages/Privacy.tsx`, `src/pages/Disclaimer.tsx` (JSON-LD only)

### Out of scope
- No database changes
- No new routes or features
- No content rewriting (Cookies content stays identical, only layout changes)
