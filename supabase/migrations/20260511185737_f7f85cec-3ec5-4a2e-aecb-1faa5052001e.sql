-- Backfill prop firm tags so filters work
UPDATE public.brokers SET tags = ARRAY['prop-firm','2-step'] WHERE slug = 'ftmo';
UPDATE public.brokers SET tags = ARRAY['prop-firm','1-step','2-step','funded'] WHERE slug = 'fundednext';
UPDATE public.brokers SET tags = ARRAY['prop-firm','instant-funding','low-cost','no-time-limit'] WHERE slug = 'the5ers';
UPDATE public.brokers SET tags = ARRAY['prop-firm','2-step'] WHERE slug = 'e8-markets';
UPDATE public.brokers SET tags = ARRAY['prop-firm'] WHERE slug = 'my-forex-funds';
UPDATE public.brokers SET tags = ARRAY['prop-firm','instant-funding','futures','no-time-limit'] WHERE slug = 'apex-trader-funding';
UPDATE public.brokers SET tags = ARRAY['prop-firm','1-step','futures'] WHERE slug = 'topstep';