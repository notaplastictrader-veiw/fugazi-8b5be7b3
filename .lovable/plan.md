

# Plan: Prop Firm Homepage Tags + Signal Hub "View All" Text

## 1. Replace firm name tags with category tags on homepage

**File:** `src/components/sections/BrokerTrustHub.tsx` (lines 251-255)

The homepage Prop Firms section has hardcoded firm names as yellow tags: "Bullwaves Prime", "FTMO", "MyForexFunds", etc. Replace these with category labels matching the Prop Firms page filters:

**Replace:**
```
["Bullwaves Prime", "FTMO", "MyForexFunds", "The Funded Trader", "True Forex Funds", "Maven Trading"]
```

**With:**
```
["All Prop Firms", "Instant Funding", "1-Step Challenge", "2-Step Challenge", "Discount Offers", "Crypto Funded", "No Time Limit"]
```

These will remain as styled display tags (not clickable filters) — just labels showing the categories available.

## 2. Signal Hub — Change "View All →" to "View All Groups →"

**File:** `src/components/sections/SignalHub.tsx` (line 43)

Change `View All →` to `View All Groups →` for clarity.

Also check and update other "View All" links for consistency:
- `BrokerTrustHub.tsx` line 241: `View All Brokers →` — already good
- `BrokerTrustHub.tsx` line 263: `View All Prop Firms →` — already good
- `ScamAlertSection.tsx` line 64: `View All Scam Alerts →` — already good

Only SignalHub needs the update.

## Files to modify
- `src/components/sections/BrokerTrustHub.tsx` — Replace firm name tags with categories
- `src/components/sections/SignalHub.tsx` — "View All Groups →"

