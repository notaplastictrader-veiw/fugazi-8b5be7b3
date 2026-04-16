

# Plan: Make ALL Missing Hardcoded Sections Fully Editable from CMS

## Problem
Many sections still have hardcoded content that admin can't edit:
1. **SignalChannel** — Free tier card, Premium tier card (titles, features, CTAs)
2. **ForecastSection** — Tabs (Forex/Metal/Crypto) hardcoded
3. **HowItWorks** — CTA button missing on frontend even when set in DB
4. **CommunityReviews** — "Write a Review" CTA hardcoded
5. **BrokerJoinSection** — 3 tier cards (Featured+Verified, Verified Partner, Basic Listing) hardcoded
6. **Navbar** — All menu items hardcoded
7. **Footer** — All link columns + social links hardcoded

## Changes Per Section

### 1. SignalChannel — add tier cards to CMS
New CMS keys in `signal_channel`:
- `free_tier`: { badge, title, description, features[], cta, footer_note }
- `premium_tier`: { badge, title, win_rate, win_rate_label, description, features[], cta }

### 2. ForecastSection — make tabs editable
Add `categories` to `forecast_section`: `[{ key: "forex", label: "Forex" }, { key: "gold", label: "Metal (GOLD)" }, { key: "crypto", label: "Crypto" }]`

Currently DB only has `["Shares"]` — wrong. Reset to proper 3 tabs.

### 3. HowItWorks — verify CTA renders
DB has `cta_text: "Try now!"` but user says it's missing on front. Check component — already reads `ctaText`. Probably renders. Verify and fix if needed.

### 4. CommunityReviews — add Write Review CTA
Add `cta_text` and `cta_link` to `community_reviews` settings. Render button in component.

### 5. BrokerJoinSection — add 3 tier cards
Add `tiers` array to `broker_join_section`:
```json
"tiers": [
  { "name": "Featured + Verified", "badge": "Best for high-volume brokers", "features": [...], "cta": "Contact Us →", "highlighted": false },
  { "name": "Verified Partner", "badge": "Most popular choice", "features": [...], "cta": "Contact Us →", "highlighted": true },
  { "name": "Basic Listing", "badge": "", "features": [...], "cta": "Get Listed →", "highlighted": false }
],
"footer_note": "All listings are reviewed before going live...",
"claim_text": "Already listed? Claim your profile →"
```

### 6. Navbar — make menu editable
New `site_settings` key: `navbar_menu`:
```json
{
  "items": [
    { "label": "Broker Reviews", "href": "/brokers" },
    { "label": "Prop Firms", "href": "/prop-firms" },
    { "label": "Sports", "href": "/sports" },
    { "label": "Signals", "href": "/signals" },
    { "label": "Education", "href": "/education" },
    { "label": "More", "href": "#", "dropdown": [...] }
  ]
}
```

### 7. Footer — make all columns + social links editable
New `site_settings` key: `footer`:
```json
{
  "brand_description": "The world's most transparent...",
  "columns": [
    { "title": "Brokers", "links": [{ "label": "...", "href": "..." }] },
    { "title": "Prop Firms", "links": [...] },
    { "title": "Signals & More", "links": [...] },
    { "title": "Company", "links": [...] }
  ],
  "social_links": [
    { "platform": "X", "url": "" },
    { "platform": "LinkedIn", "url": "" },
    { "platform": "YouTube", "url": "" },
    { "platform": "Telegram", "url": "" },
    { "platform": "Facebook", "url": "" },
    { "platform": "Instagram", "url": "" },
    { "platform": "TikTok", "url": "" }
  ],
  "risk_warning": "Trading foreign exchange...",
  "copyright_suffix": "All rights reserved."
}
```

### 8. SectionEditor — add all new fields
Add new section configs:
- `signal-channel` → free_tier (object), premium_tier (object) with subfields
- `forecast-section` → categories (object-list with key, label)
- `community-reviews` → cta_text, cta_link
- `broker-join` → tiers (object-list), footer_note, claim_text
- New section: `navbar` → items (object-list)
- New section: `footer` → columns, social_links, brand_description, risk_warning

### 9. SiteContentAdmin — add new section cards
Add Navbar and Footer cards to the section grid.

## Files Changed: 8
- `src/components/sections/SignalChannel.tsx` — render tier cards from CMS
- `src/components/sections/ForecastSection.tsx` — render tabs from CMS
- `src/components/sections/CommunityReviews.tsx` — add Write Review CTA
- `src/components/sections/BrokerJoinSection.tsx` — render 3 tiers from CMS
- `src/components/layout/Navbar.tsx` — read menu from CMS
- `src/components/layout/Footer.tsx` — read all from CMS (with hardcoded fallbacks)
- `src/pages/admin/SectionEditor.tsx` — add all new field configs + new sections
- `src/pages/admin/SiteContentAdmin.tsx` — add Navbar and Footer cards

## DB Operations
- UPDATE `site_settings.signal_channel` → add free_tier + premium_tier
- UPDATE `site_settings.forecast_section` → fix categories (3 proper tabs)
- UPDATE `site_settings.community_reviews` → add cta_text, cta_link
- UPDATE `site_settings.broker_join_section` → add tiers, footer_note, claim_text
- INSERT `site_settings.navbar_menu` → with menu items
- INSERT `site_settings.footer` → with columns, social, warning

## Notes
- All components keep hardcoded fallbacks so site never breaks if DB is empty
- Social links default to empty string `""` — admin can fill them later
- Navbar/Footer become editable via Site Content admin grid

