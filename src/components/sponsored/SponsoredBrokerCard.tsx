import { ExternalLink, Sparkles, Award } from "lucide-react";
import { useSponsorCampaigns } from "./useSponsorCampaigns";

const SponsoredBrokerCard = () => {
  const { top } = useSponsorCampaigns("broker-listing-boost");
  if (!top) return null;

  return (
    <a
      href={top.cta_url || "#"}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className="relative block rounded-xl p-5 border-2 border-accent/60 bg-gradient-to-br from-accent/10 via-background to-primary/5 hover:border-accent transition-all group overflow-hidden"
    >
      <span className="absolute top-2 right-2 flex items-center gap-1 text-[9px] font-mono uppercase tracking-widest text-accent bg-accent/10 border border-accent/30 px-2 py-0.5 rounded-full">
        <Sparkles className="w-3 h-3" /> Sponsored
      </span>
      <div className="flex items-start gap-3 mb-4">
        <div className="w-12 h-12 rounded-lg bg-accent/10 border border-accent/30 flex items-center justify-center shrink-0 overflow-hidden">
          {top.sponsor_logo_url ? (
            <img loading="lazy" decoding="async" src={top.sponsor_logo_url} alt={top.sponsor_name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-lg font-display font-extrabold text-accent">{top.sponsor_name.charAt(0)}</span>
          )}
        </div>
        <div className="min-w-0 mt-1">
          <h3 className="text-lg font-bold text-foreground truncate">{top.sponsor_name}</h3>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 mt-1 text-[10px] font-semibold border rounded-full text-accent bg-accent/10 border-accent/30">
            <Award className="w-3 h-3" /> Featured Sponsor
          </span>
        </div>
      </div>
      <p className="text-sm font-display font-bold text-foreground mb-1.5 line-clamp-2">{top.headline}</p>
      {top.subtext && <p className="text-xs text-muted-foreground mb-4 line-clamp-2">{top.subtext}</p>}
      <span className="inline-flex items-center gap-1 text-xs text-accent group-hover:underline font-semibold">
        {top.cta_label || "Learn More"} <ExternalLink className="w-3 h-3" />
      </span>
    </a>
  );
};

export default SponsoredBrokerCard;
