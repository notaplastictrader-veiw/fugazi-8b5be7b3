import { forwardRef, HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface NeonCardProps extends HTMLAttributes<HTMLDivElement> {
  accent?: "primary" | "accent" | "destructive";
  glow?: "sm" | "md" | "lg";
}

/**
 * Premium "neon-outlined" card — TheTrustedProp-inspired,
 * uses NAFT semantic tokens. Used across all listing pages.
 */
const NeonCard = forwardRef<HTMLDivElement, NeonCardProps>(
  ({ className, accent = "primary", glow = "md", children, ...props }, ref) => {
    const accentVar =
      accent === "destructive"
        ? "var(--destructive)"
        : accent === "accent"
        ? "var(--accent)"
        : "var(--primary)";

    const glowSize =
      glow === "sm" ? "0 0 14px" : glow === "lg" ? "0 0 32px" : "0 0 22px";

    return (
      <div
        ref={ref}
        className={cn(
          "relative rounded-xl bg-card/60 backdrop-blur-sm transition-all duration-300",
          "border hover:-translate-y-0.5",
          className
        )}
        style={{
          borderColor: `hsl(${accentVar} / 0.28)`,
          boxShadow: `${glowSize} hsl(${accentVar} / 0.12), inset 0 1px 0 hsl(${accentVar} / 0.06)`,
          ...(props.style || {}),
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = `hsl(${accentVar} / 0.65)`;
          e.currentTarget.style.boxShadow = `${glowSize.replace(
            /\d+px/,
            (m) => `${parseInt(m) + 8}px`
          )} hsl(${accentVar} / 0.28), inset 0 1px 0 hsl(${accentVar} / 0.12)`;
          props.onMouseEnter?.(e);
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = `hsl(${accentVar} / 0.28)`;
          e.currentTarget.style.boxShadow = `${glowSize} hsl(${accentVar} / 0.12), inset 0 1px 0 hsl(${accentVar} / 0.06)`;
          props.onMouseLeave?.(e);
        }}
        {...props}
      >
        {/* Top accent line */}
        <span
          aria-hidden
          className="pointer-events-none absolute top-0 left-0 right-0 h-px"
          style={{
            background: `linear-gradient(90deg, transparent, hsl(${accentVar} / 0.5), transparent)`,
          }}
        />
        {children}
      </div>
    );
  }
);

NeonCard.displayName = "NeonCard";
export default NeonCard;
