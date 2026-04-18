-- Function to sync tier booleans
CREATE OR REPLACE FUNCTION public.sync_tier_flags()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.is_verified := (NEW.tier IN ('verified', 'featured'));
  NEW.is_featured := (NEW.tier = 'featured');
  RETURN NEW;
END;
$$;

-- Triggers for all three profile tables
DROP TRIGGER IF EXISTS sync_tier_flags_broker ON public.broker_profiles;
CREATE TRIGGER sync_tier_flags_broker
  BEFORE INSERT OR UPDATE OF tier ON public.broker_profiles
  FOR EACH ROW EXECUTE FUNCTION public.sync_tier_flags();

DROP TRIGGER IF EXISTS sync_tier_flags_signal ON public.signal_profiles;
CREATE TRIGGER sync_tier_flags_signal
  BEFORE INSERT OR UPDATE OF tier ON public.signal_profiles
  FOR EACH ROW EXECUTE FUNCTION public.sync_tier_flags();

DROP TRIGGER IF EXISTS sync_tier_flags_betting ON public.betting_profiles;
CREATE TRIGGER sync_tier_flags_betting
  BEFORE INSERT OR UPDATE OF tier ON public.betting_profiles
  FOR EACH ROW EXECUTE FUNCTION public.sync_tier_flags();

-- Backfill existing rows
UPDATE public.broker_profiles
   SET is_verified = (tier IN ('verified','featured')),
       is_featured = (tier = 'featured');

UPDATE public.signal_profiles
   SET is_verified = (tier IN ('verified','featured')),
       is_featured = (tier = 'featured');

UPDATE public.betting_profiles
   SET is_verified = (tier IN ('verified','featured')),
       is_featured = (tier = 'featured');