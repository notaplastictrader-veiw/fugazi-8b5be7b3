import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook to track referral clicks from ?ref= query parameter.
 * Call this once in the app root.
 */
export const useReferralTracking = () => {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const refCode = searchParams.get("ref");
    if (!refCode) return;

    const trackClick = async () => {
      // Check if already tracked this session
      const tracked = sessionStorage.getItem(`ref-tracked-${refCode}`);
      if (tracked) return;

      // Hardened RPC: validates the code, inserts the click, and increments
      // the counter atomically server-side. Returns silently for invalid codes.
      await supabase.rpc("record_referral_click" as any, {
        _code: refCode,
        _user_agent: navigator.userAgent,
        _referrer_url: document.referrer || null,
      });

      // Store the code for conversion tracking on signup
      sessionStorage.setItem("ref-tracked-code", refCode);
      sessionStorage.setItem(`ref-tracked-${refCode}`, "1");
    };

    trackClick();
  }, [searchParams]);
};
