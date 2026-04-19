

User is asking: "If I'm a broker named 'Finance' and I buy ALL these advertising placements, what benefits do I get, and where on the website will my brand show up?" They also want a **demo seed** so they can see it live.

Let me think about each placement and what it should *actually* deliver. Right now these are just empty catalog items — no fulfilment system exists. So the plan needs two parts: (1) explain what each placement means, (2) build the rendering surfaces so a paid broker actually shows up.

Looking at the codebase: `brokers` table already has `is_featured`, `homepage_position`, `show_on_homepage`. `signal_groups` has `verified`. There's `BrokerTrustHub`, `SignalChannel`, `PromoTicker`, `BottomTicker`, `HeroSection`. So we have surfaces — we just need to wire them to a "sponsored" concept tied to the placement system.

## Plan

### 1. What each placement delivers (benefits matrix)

| # | Placement | Where it shows | What sponsor gets |
|---|---|---|---|
| 1 | **Homepage Banner** | Below Hero, above Trust Hub on `/` | Full-width 1200x200 banner with CTA, sponsor logo + tagline |
| 2 | **Broker Listing Boost** | `/brokers` page + `BrokerTrustHub` homepage section | "Sponsored" badge, pinned to top position, gold border |
| 3 | **Signal Channel Sponsor** | `SignalChannel` homepage section + `/signals` | Logo strip "Powered by [Broker]", link to broker |
| 4 | **Sitewide Banner** | Top `PromoTicker` (every page) | Sponsor message scrolling in ticker, clickable |
| 5 | **Newsletter Sponsor** | (Future newsletter — for now: footer "Newsletter sponsored by" line) | Logo + 1-line copy in footer + future emails |
| 6 | **Custom Campaign** | Any combo above + dedicated landing block | Custom — admin-configured |

### 2. New table: `ad_campaigns` (live, running ads)
Separate from `ad_placements` (catalog) and `ad_enquiries` (leads). This is the actual paid, live placement.

Columns: `id`, `placement_slug` (FK to ad_placements), `sponsor_name`, `sponsor_logo_url`, `headline`, `subtext`, `cta_label`, `cta_url`, `image_url` (for banner), `is_active`, `start_date`, `end_date`, `display_order`, `created_at`.

RLS: public SELECT where `is_active=true AND now() between start_date and end_date`; admin full access.

### 3. New rendering components (where ads actually appear)
- `<SponsoredBanner placement="homepage-banner" />` — homepage hero banner
- `<SponsoredTickerItems />` — injects into `PromoTicker` for `sitewide-banner`
- `<SponsoredBrokerBadge brokerId={...} />` — gold "Sponsored" badge on broker cards (matched by sponsor name → broker)
- `<SponsoredBy placement="signal-channel-sponsor" />` — "Powered by" strip in `SignalChannel`
- `<NewsletterSponsorFooter />` — sponsor line in footer

Each component fetches active campaigns for its placement_slug, renders nothing if none active.

### 4. New admin page `/admin/advertise/campaigns`
CRUD for `ad_campaigns`: pick placement, upload sponsor logo + banner image, set headline/CTA/URL, set start/end dates, toggle active. Convert "won" enquiry → campaign with one click.

### 5. Demo seed for "Finance" broker
Insert 6 active campaigns, all sponsored by **"Finance"**, one per placement, running today → +90 days, with placeholder logo URL and sample copy. So the user can immediately see Finance branding everywhere on the site.

Sample seed data:
- Homepage Banner: "Trade with Finance — 0.0 pip spreads, regulated globally" + CTA "Open Account"
- Broker Listing Boost: Finance pinned #1 on /brokers with gold border + "Sponsored" badge
- Signal Channel Sponsor: "Signals powered by Finance" strip
- Sitewide Banner: "🎁 Finance: Get $50 free on first deposit — limited time"
- Newsletter Sponsor: Footer line "This week's newsletter sponsored by Finance"
- Custom Campaign: Featured slot in homepage forecasts section

### 6. Files touched
- New migration: `ad_campaigns` table + RLS + 6-row "Finance" demo seed
- `src/components/sponsored/SponsoredBanner.tsx` — new
- `src/components/sponsored/SponsoredTickerItems.tsx` — new
- `src/components/sponsored/SponsoredBy.tsx` — new
- `src/components/sponsored/SponsoredBrokerBadge.tsx` — new
- `src/components/sponsored/NewsletterSponsorFooter.tsx` — new
- `src/pages/Index.tsx` — mount `SponsoredBanner` after Hero
- `src/components/sections/PromoTicker.tsx` — merge sponsored ticker items
- `src/components/sections/BrokerTrustHub.tsx` — show sponsored badge on matching broker
- `src/components/sections/SignalChannel.tsx` — add "Powered by" strip
- `src/components/layout/Footer.tsx` — newsletter sponsor line
- `src/pages/admin/AdvertiseCampaignsAdmin.tsx` — new CRUD page
- `src/components/admin/AdminSidebar.tsx` — add "Live Campaigns" link
- `src/App.tsx` — register new admin route

### Out of scope (kept simple)
- Click-tracking analytics per campaign (can add later — separate `ad_clicks` table)
- A/B testing or rotation between multiple sponsors per slot (for now: highest `display_order`, single active)
- Stripe billing for campaigns (manual admin activation after payment received)
- Auto-expiry email reminders to sponsors

### After this is built
You'll see "Finance" branding live across:
homepage banner → ticker → trust hub broker card → signal section → footer. Exactly what a paying sponsor would get.

