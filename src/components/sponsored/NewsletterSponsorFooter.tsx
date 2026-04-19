import { useSponsorCampaigns } from "./useSponsorCampaigns";

const NewsletterSponsorFooter = () => {
  const { top } = useSponsorCampaigns("newsletter-sponsor");
  if (!top) return null;

  return (
    <div className="mt-8 pt-6 border-t border-border/50">
      <a
        href={top.cta_url || "#"}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className="flex items-center gap-3 group"
      >
        <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Sponsored:</span>
        {top.sponsor_logo_url && (
          <img src={top.sponsor_logo_url} alt={top.sponsor_name} className="w-7 h-7 rounded object-cover" />
        )}
        <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors">
          {top.headline} {top.subtext && <span className="text-foreground/60">— {top.subtext}</span>}
        </span>
      </a>
    </div>
  );
};

export default NewsletterSponsorFooter;
