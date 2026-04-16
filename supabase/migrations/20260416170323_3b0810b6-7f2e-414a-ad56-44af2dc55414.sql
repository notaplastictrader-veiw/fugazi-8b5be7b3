UPDATE public.site_settings
SET value = '{
  "section_title": "Top Verified",
  "broker_subtitle": "Every broker scored by real user data — complaints, withdrawal speed, regulation strength.",
  "broker_count": 50,
  "broker_filters": ["All", "Forex", "Crypto", "Binary", "ECN", "Prop Firms", "Scam Watch"],
  "prop_section_title": "Top Verified",
  "prop_subtitle": "Funded trading accounts reviewed by real traders. Challenge fees, payouts, and rules — all verified.",
  "prop_firm_count": 6,
  "prop_firm_categories": ["All Prop Firms", "Instant Funding", "1-Step Clg", "2-Step Clg", "Dis% Offers", "No Time Limit"]
}'::jsonb,
updated_at = now()
WHERE key = 'broker_trust_hub';