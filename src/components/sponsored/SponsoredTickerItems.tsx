import { useSponsorCampaigns } from "./useSponsorCampaigns";

export const useSponsoredTickerItems = (placement = "sitewide-banner") => {
  const { campaigns } = useSponsorCampaigns(placement);
  return campaigns.map((c) => ({
    label: c.headline,
    url: c.cta_url || "#",
    sponsor: c.sponsor_name,
  }));
};
