
-- ============================================================
-- profiles: drop public table-level read; expose safe view
-- ============================================================
DROP POLICY IF EXISTS "Public profiles are viewable" ON public.profiles;

CREATE OR REPLACE VIEW public.profiles_public AS
SELECT id, user_id, username, full_name, avatar_url, country, country_code,
       bio, experience_level, trading_style, reputation_score, reputation_tier,
       show_real_name, show_country, show_journal_stats, show_complaints,
       social_twitter, social_telegram, social_facebook, social_instagram,
       social_youtube, social_tiktok, social_linkedin,
       theme_preference, created_at, updated_at, is_public
FROM public.profiles
WHERE is_public = true;

GRANT SELECT ON public.profiles_public TO anon, authenticated;

-- ============================================================
-- broker_profiles / betting_profiles / signal_profiles
-- ============================================================
DROP POLICY IF EXISTS "Anyone can view broker profiles" ON public.broker_profiles;
DROP POLICY IF EXISTS "Anyone can view betting profiles" ON public.betting_profiles;
DROP POLICY IF EXISTS "Anyone can view signal profiles" ON public.signal_profiles;

CREATE OR REPLACE VIEW public.broker_profiles_public AS
SELECT id, broker_id, tier, claim_status, is_verified, is_featured,
       featured_position, claimed_by, created_at, updated_at
FROM public.broker_profiles;

CREATE OR REPLACE VIEW public.betting_profiles_public AS
SELECT id, site_name, slug, tier, claim_status, is_verified, is_featured,
       featured_position, supported_sports, affiliate_url, claimed_by,
       created_at, updated_at
FROM public.betting_profiles;

CREATE OR REPLACE VIEW public.signal_profiles_public AS
SELECT id, signal_group_id, tier, claim_status, is_verified, is_featured,
       featured_position, claimed_by, created_at, updated_at
FROM public.signal_profiles;

GRANT SELECT ON public.broker_profiles_public  TO anon, authenticated;
GRANT SELECT ON public.betting_profiles_public TO anon, authenticated;
GRANT SELECT ON public.signal_profiles_public  TO anon, authenticated;

-- ============================================================
-- ad_placements
-- ============================================================
DROP POLICY IF EXISTS "Public can view active placements" ON public.ad_placements;

CREATE OR REPLACE VIEW public.ad_placements_public AS
SELECT id, slug, title, description, icon, display_order, is_active,
       created_at, updated_at
FROM public.ad_placements
WHERE is_active = true;

GRANT SELECT ON public.ad_placements_public TO anon, authenticated;

-- ============================================================
-- referral_codes: kill anon blanket read; expose lookup RPC
-- ============================================================
DROP POLICY IF EXISTS "Anon can read referral_codes by code" ON public.referral_codes;

CREATE OR REPLACE FUNCTION public.lookup_referral_code(_code text)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.referral_codes WHERE code = _code LIMIT 1;
$$;

REVOKE EXECUTE ON FUNCTION public.lookup_referral_code(text) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.lookup_referral_code(text) TO anon, authenticated;
