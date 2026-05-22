import { useState } from "react";
import { Copy, Check, ArrowUpRight, Tag } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useTrackEvent } from "@/hooks/useTrackEvent";

interface OfferRailProps {
  /** Promo / coupon code, e.g. "NAFT25". Optional. */
  code?: string | null;
  /** Short offer label, e.g. "25% OFF", "$50 BONUS", "FREE VPS". Optional. */
  label?: string | null;
  /** Affiliate / signup URL. Required for the rail to render. */
  url?: string | null;
  /** Display name of the broker / firm / site for toast + analytics. */
  entityName: string;
  /** Visual variant. `wide` is for full review headers. */
  variant?: "card" | "wide";
  className?: string;
}

/**
 * One-row offer rail: shows discount label, a copyable promo code, and a Claim CTA.
 * Clicking the code copies it AND opens the affiliate URL in a new tab.
 * If only a URL is provided, the rail collapses to a single Visit Site button.
 * If no URL is provided, the rail is hidden entirely.
 */
const OfferRail = ({ code, label, url, entityName, variant = "card", className }: OfferRailProps) => {
  const [copied, setCopied] = useState(false);
  const track = useTrackEvent();

  if (!url) return null;

  const hasCode = !!code?.trim();

  const claim = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (hasCode) {
      try {
        await navigator.clipboard.writeText(code!.trim());
        setCopied(true);
        toast.success(`Code copied — opening ${entityName}…`, { description: code! });
        setTimeout(() => setCopied(false), 1800);
      } catch {
        toast.message(`Opening ${entityName}…`);
      }
    }
    track("offer_claim", { entity: entityName, code: code || null });
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const isWide = variant === "wide";

  // Inactive bonus state — when label signals no current offer, render a muted, non-CTA pill
  const isNoBonus = !!label && /^no\s|no active|0%\s*bonus/i.test(label);

  // No code → single CTA button (used for brokers — bonus-only)
  if (!hasCode) {
    if (isNoBonus) {
      return (
        <div
          className={cn(
            "w-full inline-flex items-center justify-center gap-2 rounded-lg",
            "border border-border bg-muted/30",
            "text-muted-foreground font-display font-extrabold text-xs tracking-wide uppercase",
            "py-2.5 px-3",
            isWide && "py-3 text-xs",
            className
          )}
          aria-label="No active bonus at this time"
        >
          <Tag className={cn("opacity-60 shrink-0", isWide ? "w-3.5 h-3.5" : "w-3 h-3")} />
          <span>{label} — check back soon</span>
        </div>
      );
    }
    const ctaText = label ? `Claim ${label}` : `Open Account`;
    return (
      <button
        type="button"
        onClick={claim}
        className={cn(
          "group w-full inline-flex items-center justify-center gap-1.5 rounded-lg",
          "bg-primary text-primary-foreground hover:bg-primary/90",
          "font-display font-extrabold text-xs tracking-wide uppercase",
          "shadow-[0_4px_14px_-4px_hsl(var(--primary)/0.5)] hover:shadow-[0_6px_18px_-4px_hsl(var(--primary)/0.6)]",
          "transition-all py-2.5 px-3",
          isWide && "py-3 text-xs",
          className
        )}
      >
        <span>{ctaText}</span>
        <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </button>
    );
  }


  return (
    <div
      className={cn(
        "relative w-full rounded-lg overflow-hidden",
        "border border-accent/25 bg-gradient-to-r from-accent/10 via-background/40 to-primary/10",
        "transition-all hover:border-accent/50",
        className
      )}
    >
      {/* hover sweep */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 bg-gradient-to-r from-transparent via-primary/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
      />
      <div className={cn("flex items-stretch", isWide ? "h-12" : "h-10")}>
        {/* Offer chevron tag */}
        {label && (
          <div className="flex items-center pl-3 pr-2 shrink-0">
            <Tag className={cn("text-accent mr-1.5", isWide ? "w-4 h-4" : "w-3 h-3")} />
            <span
              className={cn(
                "font-display font-extrabold tracking-tight text-accent uppercase whitespace-nowrap",
                isWide ? "text-sm" : "text-[11px]"
              )}
            >
              {label}
            </span>
          </div>
        )}

        {/* dashed connector */}
        <div className="flex-1 flex items-center px-2 min-w-0">
          <div className="w-full border-t border-dashed border-border/60" />
        </div>

        {/* Code + Claim — single tap zone */}
        <button
          type="button"
          onClick={claim}
          className={cn(
            "group/btn flex items-center gap-2 pl-3 pr-3 shrink-0",
            "border-l border-border/40",
            "hover:bg-primary/10 transition-colors"
          )}
          title={`Copy ${code} & open ${entityName}`}
        >
          <span className={cn("font-mono text-muted-foreground tracking-wider", isWide ? "text-[10px]" : "text-[9px]")}>
            CODE
          </span>
          <span
            className={cn(
              "font-mono font-bold text-foreground tracking-wider",
              isWide ? "text-sm" : "text-xs"
            )}
          >
            {code}
          </span>
          {copied ? (
            <Check className={cn("text-primary", isWide ? "w-4 h-4" : "w-3.5 h-3.5")} />
          ) : (
            <Copy className={cn("text-muted-foreground group-hover/btn:text-primary transition-colors", isWide ? "w-4 h-4" : "w-3.5 h-3.5")} />
          )}
          <span className="mx-1 h-4 w-px bg-border/60" aria-hidden />
          <span
            className={cn(
              "inline-flex items-center gap-0.5 font-mono font-semibold uppercase text-primary",
              isWide ? "text-xs" : "text-[10px]"
            )}
          >
            Claim
            <ArrowUpRight className={cn("transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5", isWide ? "w-3.5 h-3.5" : "w-3 h-3")} />
          </span>
        </button>
      </div>
    </div>
  );
};

export default OfferRail;
