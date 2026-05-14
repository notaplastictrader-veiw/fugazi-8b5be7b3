import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ExternalLink, GitCompare, Star } from "lucide-react";
import AffiliateDisclosure from "@/components/common/AffiliateDisclosure";

interface Props {
  broker: { name: string; slug: string; score: number; website_url?: string; logo_url?: string | null };
  onWriteReview?: () => void;
}

const StickyBrokerCTA = ({ broker, onWriteReview }: Props) => {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div
      className={`fixed left-0 right-0 z-[150] transition-transform duration-300 ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
      style={{ bottom: "58px" /* above mobile bottom nav; desktop ticker is 32px so still fine */ }}
      role="region"
      aria-label={`${broker.name} quick actions`}
    >
      <div className="mx-auto max-w-5xl px-3 pb-2 md:pb-3">
        <div className="glass-card rounded-2xl border border-border/80 shadow-[0_-8px_30px_-12px_rgba(0,0,0,0.35)] backdrop-blur-xl px-3 py-2.5 flex items-center gap-3">
          {broker.logo_url && (
            <img src={broker.logo_url} alt="" className="w-9 h-9 rounded-lg object-contain bg-background border border-border shrink-0" />
          )}
          <div className="min-w-0 flex-1">
            <div className="text-sm font-display font-bold text-foreground truncate">{broker.name}</div>
            <div className="text-[11px] font-mono text-muted-foreground">Trust score {Math.round(broker.score * 10)}/100</div>
          </div>
          <button
            onClick={onWriteReview}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-xs font-display font-semibold text-foreground hover:border-primary/40 hover:text-primary transition-colors"
          >
            <Star className="w-3.5 h-3.5" /> Write review
          </button>
          <Link
            to={`/compare?b=${broker.slug}`}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-xs font-display font-semibold text-foreground hover:border-primary/40 hover:text-primary transition-colors"
          >
            <GitCompare className="w-3.5 h-3.5" /> Compare
          </Link>
          {broker.website_url && (
            <div className="flex flex-col items-end gap-0.5">
              <a
                href={broker.website_url}
                target="_blank"
                rel="nofollow noopener noreferrer sponsored"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-display font-bold uppercase tracking-wider hover:opacity-90 transition-opacity"
              >
                Visit <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <AffiliateDisclosure />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StickyBrokerCTA;
