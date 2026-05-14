import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Link } from "react-router-dom";

interface Props {
  variant?: "inline" | "block";
  className?: string;
}

/**
 * FTC-grade affiliate disclosure. Place next to any affiliate CTA / referral link.
 * Required by Wave 3 (Trust Moat). Never hide; never style as a generic muted pill.
 */
const AffiliateDisclosure = ({ variant = "inline", className = "" }: Props) => {
  if (variant === "block") {
    return (
      <div className={`text-[11px] text-muted-foreground border border-border/40 bg-secondary/30 rounded-md px-3 py-2 leading-relaxed ${className}`}>
        <strong className="text-foreground/80">Affiliate disclosure:</strong>{" "}
        NAFT may earn a commission if you sign up through this link. This never affects
        our trust scores or rankings — see our{" "}
        <Link to="/how-we-review" className="underline text-primary hover:text-primary/80">
          methodology
        </Link>.
      </div>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={`inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors cursor-help ${className}`}>
            <Info className="w-3 h-3" />
            Ad · Affiliate
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs text-xs">
          NAFT may earn a commission if you sign up through this link. This never affects
          our trust scores or rankings.
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default AffiliateDisclosure;
