

# Plan: Make Broker Trust Hub Fully Editable from CMS

## Problem
The Broker Trust Hub has many hardcoded texts that can't be edited from admin:
- Broker subtitle: "Every broker scored by real user data — complaints, withdrawal speed, regulation strength."
- Broker filter tabs: All, Forex, Crypto, Binary, ECN, Prop Firms, Scam Watch
- Prop Firms title: "Top Verified" (hardcoded separately from broker title)
- Prop Firms subtitle: "Funded trading accounts reviewed by real traders..."
- Prop firm display count: hardcoded to 6 (`.slice(0, 6)`)
- No separate broker_count vs prop_firm_count

## Changes

### 1. Update DB `site_settings.broker_trust_hub` value
Add missing fields to the JSON:
```json
{
  "section_title": "Top Verified",
  "broker_subtitle": "Every broker scored by real user data — complaints, withdrawal speed, regulation strength.",
  "broker_count": 50,
  "broker_filters": ["All", "Forex", "Crypto", "Binary", "ECN", "Prop Firms", "Scam Watch"],
  "prop_section_title": "Top Verified",
  "prop_subtitle": "Funded trading accounts reviewed by real traders. Challenge fees, payouts, and rules — all verified.",
  "prop_firm_count": 6,
  "prop_firm_categories": ["All Prop Firms", "Instant Funding", "1-Step Clg", "2-Step Clg", "Dis% Offers", "No Time Limit"]
}
```

### 2. Update `BrokerTrustHub.tsx`
Read new CMS fields with fallbacks:
- `cms.broker_subtitle` for broker description
- `cms.broker_filters` for filter tabs
- `cms.prop_section_title` for prop firms heading
- `cms.prop_subtitle` for prop firms description
- `cms.prop_firm_count` for prop firms limit

### 3. Update `SectionEditor.tsx` broker-trust-hub config
Add form fields for all new keys:
- `broker_subtitle` (textarea)
- `broker_filters` (list)
- `prop_section_title` (text)
- `prop_subtitle` (textarea)
- `prop_firm_count` (number)

### 4. Update `SiteSettingsAdmin.tsx` default
Update the `broker_trust_hub` default to include all new fields.

## Files: 3
- `src/components/sections/BrokerTrustHub.tsx` — read new CMS fields
- `src/pages/admin/SectionEditor.tsx` — add form fields for new keys
- `src/pages/admin/SiteSettingsAdmin.tsx` — update default JSON

## DB: 1 update
- Update `site_settings` row where key = `broker_trust_hub` with full data

