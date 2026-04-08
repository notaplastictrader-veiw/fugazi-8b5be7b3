
-- Seed brokers
INSERT INTO public.brokers (name, slug, type, tags, regulation, score, avg_spread, leverage, min_deposit, stars, review_count, complaints, badge, status) VALUES
('Exness', 'exness', 'forex', ARRAY['forex','ecn','low-spread','bd-friendly'], ARRAY['FCA','CySEC'], 9.2, '0.1 pips', 'Unlimited', '$1', 4.5, 1247, 12, 'verified', 'published'),
('IC Markets', 'ic-markets', 'forex', ARRAY['forex','ecn','low-spread'], ARRAY['ASIC','CySEC'], 9.0, '0.02 pips', '1:500', '$200', 4.5, 892, 8, 'verified', 'published'),
('XM Global', 'xm-global', 'forex', ARRAY['forex','bd-friendly'], ARRAY['ASIC','IFSC'], 7.8, '1.6 pips', '1:1000', '$5', 3.8, 634, 45, 'featured', 'published'),
('Quotex', 'quotex', 'binary', ARRAY['binary','crypto','scam-watch'], ARRAY['IFMRRC'], 4.2, 'N/A', 'N/A', '$10', 2.1, 312, 89, 'warning', 'published'),
('Pepperstone', 'pepperstone', 'forex', ARRAY['forex','ecn','low-spread'], ARRAY['ASIC','FCA'], 9.1, '0.09 pips', '1:500', '$200', 4.6, 756, 5, 'verified', 'published'),
('FTMO', 'ftmo', 'prop', ARRAY['prop'], ARRAY['Czech NB'], 8.8, 'N/A', '1:100', '$10K–$200K', 4.4, 523, 15, 'verified', 'published');

-- Seed signal groups
INSERT INTO public.signal_groups (name, win_rate, monthly_signals, avg_rr, track_record, members, verified, status) VALUES
('Gold Pulse Signals', 81, '35', '1:2.4', '14 months', '4,200', true, 'published'),
('Asia FX Scalpers', 84, '48', '1:1.8', '22 months', '12,400', true, 'published'),
('Prop Killer Trades', 78, '60+', '1:3.1', '9 months', '8,900', true, 'published');

-- Seed forecasts
INSERT INTO public.forecasts (pair, direction, potential, reasoning, updated_label, category, status) VALUES
('XAU/USD', 'bullish', 'HIGH', 'Gold breaking above key resistance at $2,340. Fed rate cut expectations fueling momentum. Target $2,400.', '2 hours ago', 'forex', 'published'),
('EUR/USD', 'bearish', 'MED', 'ECB dovish stance vs. USD strength. Expecting pullback to 1.0780 support zone.', '4 hours ago', 'forex', 'published'),
('GBP/USD', 'bullish', 'HIGH', 'Strong UK employment data. Cable targeting 1.2750 resistance with bullish momentum.', '6 hours ago', 'forex', 'published'),
('Gold Spot', 'bullish', 'HIGH', 'Central bank buying continues. Geopolitical tensions supporting safe-haven demand.', '1 hour ago', 'gold', 'published'),
('BTC/USD', 'bullish', 'HIGH', 'Post-halving accumulation phase. Institutional inflows via ETFs at record levels. Target $75K.', '3 hours ago', 'crypto', 'published');

-- Seed reviews
INSERT INTO public.reviews (author, avatar, rating, content, role, status) VALUES
('Tyler Mather', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face', 5, 'Fast withdrawals, excellent spreads. Been using for 2 years without any issues. Best broker I''ve tried.', 'Trader', 'published'),
('Wei Wen Chin', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&h=80&fit=crop&crop=face', 5, 'Raw spreads are incredible for scalping. Execution speed is top-tier. Highly recommended.', 'Trader', 'published'),
('Claudio Pensa', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face', 5, 'Passed the challenge on my second attempt. Payout was smooth via Deel. Legit prop firm.', 'Trader', 'published'),
('Omar Shazad', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face', 1, 'SCAM! Deposited $500, made profit to $1,200. They blocked my withdrawal and froze my account. Stay away!', 'Trader', 'published'),
('Erin Shafiqa', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face', 4, 'Good for beginners. Low deposit requirement. Spreads could be better though.', 'Trader', 'published'),
('Cian Casey', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=80&h=80&fit=crop&crop=face', 5, 'Switched from IC Markets. Razor account spreads are comparable. Great MT5 integration.', 'Trader', 'published'),
('Rashid Al-Fayed', 'https://images.unsplash.com/photo-1534030347209-467a5b0ad3e6?w=80&h=80&fit=crop&crop=face', 1, 'Fake regulation claims. They manipulated my trades and refused $8,000 withdrawal. Reported to authorities.', 'Trader', 'published'),
('Sofia Andersen', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face', 4, 'Solid broker overall. Withdrawals within 24h. Customer support could be faster during weekends.', 'Trader', 'published'),
('Kamal Hossain', 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=80&h=80&fit=crop&crop=face', 1, 'Complete scam. No real license. Lost 45,000 BDT. Their website disappeared after 2 months.', 'Trader', 'published'),
('Priya Mehta', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=80&h=80&fit=crop&crop=face', 5, 'Best ECN broker for Indian traders. cTrader platform is amazing. Zero issues in 3 years.', 'Trader', 'published');

-- Seed scam alerts
INSERT INTO public.scam_alerts (title, description, severity, status) VALUES
('TradeWave Markets', 'Withdrawal refused after profit - $12,400 unresolved', 'high', 'published'),
('GoldFX Pro', 'Fake regulation, platform manipulation - $8,200 under investigation', 'high', 'published'),
('CryptoEdge BD', 'Account frozen, no response 30+ days - $3,800 unresolved', 'medium', 'published');

-- Seed site settings with upsert
INSERT INTO public.site_settings (key, value) VALUES
('promo_ticker', '["🔥 Exness 100% Deposit Bonus","🚀 FTMO 20% Off Challenge","💰 Bullwaves — Start with $10","⚡ IC Markets Raw Spread 0.0","🏆 Maven Trading 90% Profit Split","🎁 XM $30 No-Deposit Bonus"]'::jsonb),
('ticker_pairs', '[{"pair":"XAU/USD","price":"2,341.50","change":"+0.82%","up":true},{"pair":"EUR/USD","price":"1.0847","change":"-0.12%","up":false},{"pair":"GBP/USD","price":"1.2634","change":"+0.25%","up":true},{"pair":"USD/JPY","price":"157.42","change":"+0.45%","up":true},{"pair":"BTC/USD","price":"67,842","change":"+2.14%","up":true},{"pair":"NASDAQ","price":"18,524","change":"-0.33%","up":false},{"pair":"OIL","price":"78.32","change":"+0.67%","up":true},{"pair":"ETH/USD","price":"3,521","change":"+1.82%","up":true}]'::jsonb),
('scam_alert_banner', '"⚠️ Warning: TradeWave Markets — Withdrawal issues reported"'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

UPDATE public.site_settings SET value = '{"brokers_reviewed":"200+","complaints_resolved":"15K+","active_traders":"50K+","countries":"180+"}'::jsonb WHERE key = 'hero_stats';
