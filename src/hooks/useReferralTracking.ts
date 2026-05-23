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

      // Look up the referral code via security-definer RPC
      const { data: codeId } = await supabase
        .rpc("lookup_referral_code" as any, { _code: refCode });

      if (!codeId) return;
      const codeData = { id: codeId as string };

      // Insert click record
      await supabase.from("referral_clicks").insert({
        referral_code_id: codeData.id,
        user_agent: navigator.userAgent,
        referrer_url: document.referrer || null,
      });

      // Increment click count on the code
      await supabase.rpc("increment_referral_clicks" as any, { code_id: codeData.id });

      // Store the code for conversion tracking on signup
      sessionStorage.setItem("ref-tracked-code", refCode);
      sessionStorage.setItem(`ref-tracked-${refCode}`, "1");
    };

    trackClick();
  }, [searchParams]);
};
