## Technical SEO Improvements Plan

Verification ar Sitemap done. Ekhon sitewide SEO quality barano hobe — Google jate site bhalo bujhte pare ar SPA hoyeo ranking pay.

### Current state (already good)

- ✅ `robots.txt` correct, sitemap reference ache
- ✅ `sitemap.xml` 20 pages list ache
- ✅ Canonical tags `<SEO>` component diye prottek page e set hocche
- ✅ OG/Twitter meta tags set ache
- ✅ JSON-LD framework ache (`JsonLd.tsx`)

### Problems to fix

**1. JSON-LD e wrong URL (CRITICAL)**
`src/components/seo/JsonLd.tsx` e Organization + WebSite schema er URL `naftreview.lovable.app` — eta old Lovable subdomain. Sob jaygaay change kore `https://www.notafugazitrader.com` korbo. Logo URL o proper logo file e point korbo.

**2. JSON-LD coverage komo**
Sudhu homepage e Organization + WebSite schema ache. Add korbo:
- `BreadcrumbList` schema — sob inner page e (better SERP display)
- `Review` / `AggregateRating` schema — Broker detail pages e (rich snippets — stars in Google results)
- `Article` schema — News/Education detail pages e
- `FAQPage` schema — homepage bottom e common questions ("Is XYZ broker safe?" etc.)

**3. Sitemap dynamic noy**
Currently static 20 URLs only. Brokers, scam alerts, news, education articles individual pages sitemap e nei. Initial step e dynamic broker URLs add korbo (top 50-100) `data/brokers.ts` theke.

**4. Meta description per page weak**
Kichu page e generic description. Audit kore unique 150-char description likhbo important pages e (Brokers, Signals, Scam Alerts, News, Calendar, Forecasts, Education).

**5. SPA prerender hint**
`index.html` e fallback content add korbo (h1 + brief description) jate Google er JS render fail korleo basic content paay. Eta crawl efficiency baray.

### Implementation steps

1. Fix `JsonLd.tsx` — replace all `naftreview.lovable.app` → `https://www.notafugazitrader.com`, fix logo path
2. Create reusable `BreadcrumbJsonLd` helper, add to all main inner pages (Brokers, Signals, ScamAlerts, News, Calendar, Forecasts, Education, About, Contact)
3. Add `Review`/`AggregateRating` schema to `BrokerDetail.tsx` (uses existing review data)
4. Add `Article` schema to `EducationArticle.tsx` ar `ScamAlertDetail.tsx`
5. Add `FAQPage` schema in homepage with 5-6 common questions
6. Audit + improve unique meta descriptions on top 10 pages
7. Expand `sitemap.xml` with broker detail URLs (from static `data/brokers.ts`)
8. Add SEO-friendly fallback content to `index.html` `<noscript>` + initial loading skeleton with H1

### Out of scope

- Full SSR/Next.js migration (separate larger project)
- Multilingual hreflang tags (separate i18n SEO work)
- Image optimization / Core Web Vitals (Option 3 e alada)

### What user needs to do after

- Publish app
- Search Console e few days wait kore "Enhancement" reports check korun (Breadcrumbs, Reviews, FAQ rich results dekhbe)
