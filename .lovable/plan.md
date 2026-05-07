## Goal
Replace the broker-specific heading in `BrokerJoinSection` with a general one that fits all 4 roles (trader, signal provider, broker, betting site) since the role-based Join cards are right below.

## Change
**File:** `src/components/sections/BrokerJoinSection.tsx`

Update the default `title` + `accentText` (CMS overrides preserved):
- Section tag: `// FOR BROKERS` → `// JOIN NAFT`
- Title: `"For Brokers & Signal Providers —"` → `"Be part of the network —"`
- Accent: `"List With Us."` → `"Built on Trust."`
- Subtitle: `"Reach 120,000+ real traders worldwide..."` → `"Traders, signal providers, brokers, and sportsbooks — find your place on the fastest-growing global trading platform."`

CMS values (if set in `site_settings.broker_join_section`) still win, so admins can override.

## Out of scope
- Touching the lower role CTA grid (already shipped).
- Changing the right-column tier cards or any other copy.
