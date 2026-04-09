INSERT INTO public.brokers (name, slug, type, tags, regulation, score, avg_spread, leverage, min_deposit, stars, review_count, complaints, badge, status) VALUES
('Bullwaves Prime', 'bullwaves-prime', 'prop-firm', ARRAY['instant-funding','crypto-funded'], ARRAY['FCA','CySEC'], 9.0, '$5K–$400K', '1:100', '$10', 4.5, 342, 5, 'verified', 'published'),
('FTMO', 'ftmo', 'prop-firm', ARRAY['challenge','no-time-limit'], ARRAY['CNB'], 8.8, '$10K–$200K', '1:100', '$155', 4.3, 1820, 12, 'verified', 'published'),
('MyForexFunds', 'myforexfunds', 'prop-firm', ARRAY['instant-funding','challenge'], ARRAY['Unregulated'], 7.5, '$5K–$300K', '1:50', '$49', 3.8, 980, 45, 'warning', 'published'),
('The Funded Trader', 'the-funded-trader', 'prop-firm', ARRAY['challenge','crypto-funded'], ARRAY['Unregulated'], 8.2, '$25K–$600K', '1:200', '$99', 4.1, 654, 18, 'verified', 'published'),
('True Forex Funds', 'true-forex-funds', 'prop-firm', ARRAY['challenge','no-time-limit'], ARRAY['Unregulated'], 8.0, '$10K–$400K', '1:100', '$79', 4.0, 430, 22, 'verified', 'published'),
('Maven Trading', 'maven-trading', 'prop-firm', ARRAY['instant-funding','no-time-limit'], ARRAY['Unregulated'], 8.5, '$5K–$200K', '1:50', '$15', 4.4, 290, 3, 'featured', 'published')
ON CONFLICT (slug) DO NOTHING;