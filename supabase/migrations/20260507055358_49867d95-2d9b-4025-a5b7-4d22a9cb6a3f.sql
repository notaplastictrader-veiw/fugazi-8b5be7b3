UPDATE public.site_settings
SET value = value
  || jsonb_build_object(
    'title', 'Be part of the network —',
    'accent_text', 'Built on Trust.',
    'subtitle', 'Traders, signal providers, brokers, and sportsbooks — find your place on the fastest-growing global trading platform.'
  )
WHERE key = 'broker_join_section';