

# Save NAFT Project Documentation to Memory

Split the comprehensive documentation into organized memory files and update the index.

## Files to Create

### 1. `mem://project/full-spec`
Complete project overview: name, stack, URL, and high-level architecture summary.

### 2. `mem://style/themes-and-fonts`
All three theme definitions (Dark, Light, Sentinel) with exact HSL values, font families, background grid overlay details, grunge text effect, glass-card, and section-tag CSS specs.

### 3. `mem://layout/main-structure`
MainLayout structure with exact pixel heights (PromoTicker 34px, Navbar 58px, TickerBar 32px), padding calculations, and detailed Navbar/Footer/TickerBar specs.

### 4. `mem://features/homepage-sections`
All 9 homepage sections in order with exact styling details: HeroSection (badge, eyebrow, headline, search, chips, stats), BrokerTrustHub, ScamAlertSection, SignalChannel, SignalHub, ForecastSection, HowItWorks, CommunityReviews, BrokerJoinSection.

### 5. `mem://project/routes-and-pages`
Complete routing table for all public pages, dashboard routes, and admin panel sub-pages.

### 6. `mem://project/features-summary`
Key features list: Auth, Admin Panel, User Dashboard, Search Palette, i18n, Themes, Cookie Consent, Live Chat, Referral Tracking, Notifications, SEO.

### 7. `mem://style/animations`
All CSS animations: scrollTicker, pulse-dot, fade-up, shimmer, slideUp with durations and purposes.

### 8. `mem://project/supabase-tables`
Tables used: brokers, scam_alerts, signal_groups, forecasts, reviews, site_settings, plus migration count.

### 9. `mem://project/assets`
All SVG logos (theme-aware), candlestick patterns, broadcast image, grain textures with paths.

### 10. Update `mem://index.md`
Add references to all new memory files while preserving existing entries.

## Approach
- Each file gets proper frontmatter (name, description, type)
- No duplication with existing memory files — merge or replace where overlap exists
- Index updated with all entries

