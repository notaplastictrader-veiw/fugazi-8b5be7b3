## Goal
Footer e short, neutral risk summary rakhbo + new dedicated `/disclaimer` page banabo jekhane full "Risk & Liability Disclaimer" thakbe (NAFT-k broker/advisor/bookmaker noy hisebe protect korar jonno).

## Changes

### 1. New page — `src/pages/Disclaimer.tsx`
Full disclaimer text (user-supplied) — sections:
- About NAFT
- Financial & Trading Content
- Sports Predictions & Betting-Related Content
- Third-Party Services
- Liability
- By Using NAFT

Styling: existing page pattern follow korbo (`Terms.tsx` / `Privacy.tsx` er moto) — MainLayout wrapper, max-w prose container, Barlow Condensed headings, `<SEO>` component with proper title/description, JSON-LD optional.

### 2. Route — `src/App.tsx`
`<Route path="/disclaimer" element={<Disclaimer />} />` add (lazy-loaded other pages er moto).

### 3. Footer short summary — `src/components/layout/Footer.tsx`
Defaults update (CMS overrides preserved):

- **Label:** `⚠ Risk & Liability Disclaimer:`
- **Body (short):**
  > Not A Fugazi Trader (NAFT) is an independent information and review platform — not a broker, advisor, signal provider, or bookmaker. All content (broker listings, signals, forecasts, sports predictions, news) is for informational and educational purposes only and is not financial, legal, or betting advice. Trading and gambling carry substantial risk of loss; you are solely responsible for verifying that any third-party service is lawful and regulated in your jurisdiction. NAFT accepts no liability for any losses arising from use of this site or third-party services. [Read full disclaimer →](/disclaimer)

The "Read full disclaimer →" rendered as `<Link to="/disclaimer">`.

### 4. Footer "Company" column — add link
Insert `{ label: "Disclaimer", href: "/disclaimer" }` between Terms and Privacy in `defaultColumns`.

### 5. Update CMS row in DB
`site_settings` row `key = 'footer'` — patch `risk_warning_label` + `risk_warning` with the new short copy (so live site reflects immediately, since CMS wins over code defaults).

## Out of scope
- Cookie banner / age gate.
- Country geo-blocking.
- Per-page (Signals/Sports) inline disclaimers.
- Translating the disclaimer to 15 languages (English-only for now; i18n later if needed).
