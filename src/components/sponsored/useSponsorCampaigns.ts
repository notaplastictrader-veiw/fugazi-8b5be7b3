import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface AdCampaign {
  id: string;
  placement_slug: string;
  sponsor_name: string;
  sponsor_logo_url: string | null;
  headline: string;
  subtext: string | null;
  cta_label: string | null;
  cta_url: string | null;
  image_url: string | null;
  display_order: number;
}

export const useSponsorCampaigns = (placementSlug: string) => {
  const [campaigns, setCampaigns] = useState<AdCampaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase
        .from("ad_campaigns")
        .select("*")
        .eq("placement_slug", placementSlug)
        .order("display_order", { ascending: false });
      if (mounted) {
        setCampaigns((data as AdCampaign[]) || []);
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [placementSlug]);

  return { campaigns, loading, top: campaigns[0] };
};
