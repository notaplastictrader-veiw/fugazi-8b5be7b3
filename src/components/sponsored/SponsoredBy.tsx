import { useSponsorCampaigns } from "./useSponsorCampaigns";

const SponsoredBy = ({ placement, label = "Powered by" }: { placement: string; label?: string }) => {
  const { top } = useSponsorCampaigns(placement);
  if (!top) return null;

  return (
    <a
      href={top.cta_url || "#"}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-accent/30 bg-accent/5 hover:bg-accent/10 transition-colors group"
    >
      <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">{label}</span>
      {top.sponsor_logo_url && (
        <img src={top.sponsor_logo_url} alt={top.sponsor_name} className="w-6 h-6 rounded object-cover" />
      )}
      <span className="text-sm font-display font-bold text-foreground group-hover:text-accent transition-colors">{top.sponsor_name}</span>
    </a>
  );
};

export default SponsoredBy;
