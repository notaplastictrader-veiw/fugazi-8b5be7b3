import { useSponsorCampaigns } from "./useSponsorCampaigns";
import { ExternalLink, Sparkles } from "lucide-react";

const SponsoredBanner = ({ placement = "homepage-banner" }: { placement?: string }) => {
  const { top } = useSponsorCampaigns(placement);
  if (!top) return null;

  return (
    <section className="px-4 py-6">
      <div className="max-w-7xl mx-auto">
        <a
          href={top.cta_url || "#"}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="group relative flex items-center gap-5 rounded-2xl border border-primary/30 bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10 p-5 md:p-6 overflow-hidden hover:border-primary/60 transition-all"
        >
          <span className="absolute top-2 right-3 text-[9px] font-mono uppercase tracking-widest text-primary/70 flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Sponsored
          </span>
          {top.sponsor_logo_url && (
            <img loading="lazy" decoding="async" src={top.sponsor_logo_url} alt={`${top.sponsor_name} logo`} className="w-14 h-14 md:w-16 md:h-16 rounded-xl object-cover bg-background border border-border shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-mono uppercase tracking-widest text-primary mb-1">{top.sponsor_name}</div>
            <h3 className="text-lg md:text-xl font-display font-extrabold text-foreground leading-tight">{top.headline}</h3>
            {top.subtext && <p className="text-xs md:text-sm text-muted-foreground mt-1 line-clamp-2">{top.subtext}</p>}
          </div>
          <span className="hidden md:inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-display font-bold shrink-0 group-hover:brightness-110 transition-all">
            {top.cta_label || "Learn More"} <ExternalLink className="w-3.5 h-3.5" />
          </span>
        </a>
      </div>
    </section>
  );
};

export default SponsoredBanner;
