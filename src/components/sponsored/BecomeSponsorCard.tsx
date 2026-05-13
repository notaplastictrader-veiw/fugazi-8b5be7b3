import { Link } from "react-router-dom";
import { Megaphone, ArrowRight } from "lucide-react";

interface Props {
  variant?: "card" | "inline";
  context?: string;
}

const BecomeSponsorCard = ({ variant = "card", context = "this page" }: Props) => {
  if (variant === "inline") {
    return (
      <Link
        to="/advertise"
        className="flex items-center justify-between gap-3 rounded-xl border border-dashed border-border bg-muted/20 hover:bg-muted/40 hover:border-primary/40 transition-colors px-4 py-3 group"
      >
        <div className="flex items-center gap-3">
          <Megaphone className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
          <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground group-hover:text-foreground">
            Your brand here — Sponsor {context}
          </span>
        </div>
        <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
      </Link>
    );
  }

  return (
    <Link
      to="/advertise"
      className="block rounded-xl border-2 border-dashed border-border hover:border-primary/40 bg-card/50 hover:bg-card p-5 transition-all group"
    >
      <div className="flex items-center gap-2 mb-2">
        <Megaphone className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
        <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Available Slot</span>
      </div>
      <h3 className="text-base font-display font-bold text-foreground mb-1">Sponsor {context}</h3>
      <p className="text-xs text-muted-foreground mb-3">Reach verified traders across 15 markets — see placements & pricing.</p>
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary group-hover:gap-2 transition-all">
        Become a sponsor <ArrowRight className="w-3 h-3" />
      </span>
    </Link>
  );
};

export default BecomeSponsorCard;
