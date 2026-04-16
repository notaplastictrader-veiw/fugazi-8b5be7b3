
INSERT INTO public.site_settings (key, value) VALUES ('signal_channel', '{
  "title": "Gold & Forex Signals You Can Actually",
  "description": "We do not talk about signals. We post them. Entry. Stop. Target. Done. No charity. No hand-holding. No fake screenshots of wins. We publish our track record publicly — every trade, every loss, every win.",
  "features_list": ["Around 78% win rate — tracked and published publicly every month","Full transparency — losses posted same as wins","No credit card needed for free tier","Multiple payment options available. DM us for details."],
  "free_tier": {"badge":"FREE TIER","title":"Basic Signal Access","description":"Daily market updates and a few signals per week. No strings attached.","features":["Market updates daily","2–3 signals per week","Gold & EURUSD only"],"price":"Free — forever","cta":"Join Free Telegram →","cta_url":"https://t.me/notaplastictrader","footer_note":"No credit card. No BS. Just signals."},
  "premium_tier": {"badge":"PREMIUM","label":"PREMIUM TIER","title":"Full Signal Suite","win_rate":"~78%","win_rate_label":"win rate · tracked publicly every month","description":"Full access. Gold, FX majors, exact entry, SL and TP. Strategy breakdown every trade.","features":["10–15 signals/week","Gold · FX · Crypto · Indices","Exact entry SL TP","Strategy breakdown per trade","VIP Telegram access"],"tagline":"Premium Access — Serious Traders Only","cta":"Apply for Access →"}
}'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();

INSERT INTO public.site_settings (key, value) VALUES ('forecast_section', '{
  "section_title": "Market",
  "subtitle": "Daily analysis. No paid promotions. No broker bias.",
  "categories": [{"key":"forex","label":"Forex"},{"key":"gold","label":"Metal (GOLD)"},{"key":"crypto","label":"Crypto"}]
}'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();

INSERT INTO public.site_settings (key, value) VALUES ('community_reviews', '{
  "section_title": "What Traders",
  "display_count": 50,
  "cta_text": "Write a review →",
  "cancel_text": "Cancel"
}'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();

INSERT INTO public.site_settings (key, value) VALUES ('broker_join_section', '{
  "title": "For Brokers & Signal Providers —",
  "subtitle": "Reach 120,000+ real traders worldwide. Promote your broker on the fastest-growing global review platform.",
  "description": "Join 280+ brokers on the fastest-growing global trading review platform. Build trust with verified reviews and transparent ratings.",
  "benefits": ["Verified badge on your profile","Reply to user reviews publicly","Featured placement in search","Promotion & analytics dashboard"],
  "cta_text": "Promote Your Broker →",
  "claim_text": "Already listed? Claim your profile →",
  "footer_note": "All listings are reviewed before going live. We do not list brokers with active unresolved scam reports.",
  "tiers": [
    {"name":"Featured + Verified","features":["Everything in Verified","Featured in search results","Homepage placement","Dedicated account manager"],"cta":"Contact Us →","link":"/advertise","style":"highlight","note":"Best for high-volume brokers"},
    {"name":"Verified Partner","features":["Verified badge","Reply to reviews","Priority support","Enhanced profile"],"cta":"Contact Us →","link":"/advertise","style":"secondary","note":"Most popular choice"},
    {"name":"Basic Listing","features":["Company profile","User reviews","Basic analytics"],"cta":"Get Listed →","link":"/broker-claim","style":"ghost","note":""}
  ]
}'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();

INSERT INTO public.site_settings (key, value) VALUES ('navbar', '{
  "more_label": "More",
  "menu_items": [
    {"label":"Broker Reviews","href":"#","highlight":false,"children":[{"label":"CFD / Forex Brokers","href":"/brokers"},{"label":"Crypto Exchanges","href":"/brokers?type=crypto"},{"label":"Binary Options","href":"/brokers?type=binary"},{"label":"ECN Brokers","href":"/brokers?type=ecn"},{"label":"Broker Comparison","href":"/compare"}]},
    {"label":"Prop Firms","href":"/prop-firms","highlight":false},
    {"label":"Sports","href":"/sports","highlight":false},
    {"label":"Signals","href":"/signals","highlight":false},
    {"label":"Education","href":"/education","highlight":false},
    {"label":"More","href":"#","highlight":true,"children":[{"label":"Promotions","href":"/promotions"},{"label":"Share Ideas","href":"/ideas"},{"label":"Calendar","href":"/calendar"},{"label":"News","href":"/news"},{"label":"About Us","href":"/about"},{"label":"Contact Us","href":"/contact"},{"label":"Become an Affiliate","href":"/partnership?tab=affiliate"},{"label":"IB Partnership","href":"/partnership?tab=ib"},{"label":"Collaboration","href":"/partnership?tab=collab"}]}
  ]
}'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();

INSERT INTO public.site_settings (key, value) VALUES ('footer', '{
  "brand_name": "Not A Fugazi",
  "brand_accent": "Trader",
  "brand_description": "The world''s most transparent broker review platform. Real reviews, real complaints, verified withdrawal proof.",
  "about_label": "About Us",
  "contact_label": "Contact Us",
  "social_links": [{"platform":"X","url":""},{"platform":"LinkedIn","url":""},{"platform":"YouTube","url":""},{"platform":"Telegram","url":""},{"platform":"Facebook","url":""},{"platform":"Instagram","url":""},{"platform":"TikTok","url":""}],
  "columns": [
    {"title":"Brokers","links":[{"label":"Forex Brokers","href":"/brokers"},{"label":"Crypto Exchanges","href":"/brokers?type=crypto"},{"label":"Binary Options","href":"/brokers?type=binary"},{"label":"Broker Comparison","href":"/compare"},{"label":"Claim Your Profile","href":"/brokers"},{"label":"Scam Alerts","href":"/scam-alerts"}]},
    {"title":"Prop Firms","links":[{"label":"Best Prop Firms","href":"/prop-firms"},{"label":"FTMO Review","href":"/brokers/ftmo"},{"label":"Maven Trading","href":"/brokers/maven"},{"label":"The5%ers","href":"/brokers/the5ers"}]},
    {"title":"Signals & More","links":[{"label":"Signal Groups","href":"/signals"},{"label":"Our Signal Channel","href":"/signals"},{"label":"Forex Forecasts","href":"/forecasts?tab=forex"},{"label":"Crypto Forecasts","href":"/forecasts?tab=crypto"},{"label":"Affiliate Program","href":"/partnership?tab=affiliate"},{"label":"Become an IB","href":"/partnership?tab=ib"}]},
    {"title":"Company","links":[{"label":"Partnership","href":"/partnership"},{"label":"Advertise","href":"/advertise"},{"label":"Terms & Conditions","href":"/terms"},{"label":"Privacy Policy","href":"/privacy"},{"label":"Cookie Policy","href":"/cookies"}]}
  ],
  "risk_warning_label": "⚠ Risk Warning:",
  "risk_warning": "Trading foreign exchange, CFDs, and cryptocurrencies carries a high level of risk and may not be suitable for all investors. The high degree of leverage can work against you as well as for you. Before deciding to trade, you should carefully consider your investment objectives, level of experience, and risk appetite. The possibility exists that you could sustain a loss of some or all of your initial investment.",
  "copyright_suffix": "All rights reserved."
}'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();
