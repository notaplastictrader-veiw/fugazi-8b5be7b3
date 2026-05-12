import { cn } from "@/lib/utils";

interface DiscountChipProps {
  pct: number;
  label?: string;
  className?: string;
}

/**
 * Discount/percentage chip. Color saturates as the discount grows.
 */
const DiscountChip = ({ pct, label = "OFF", className }: DiscountChipProps) => {
  const tier =
    pct >= 50 ? "high" : pct >= 25 ? "mid" : pct >= 10 ? "low" : "minimal";

  const styles: Record<string, string> = {
    high: "bg-primary text-primary-foreground shadow-[0_0_18px_hsl(var(--primary)/0.45)]",
    mid: "bg-primary/80 text-primary-foreground shadow-[0_0_14px_hsl(var(--primary)/0.30)]",
    low: "bg-primary/15 text-primary border border-primary/30",
    minimal: "bg-secondary text-secondary-foreground border border-border",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-1 rounded-md font-display font-extrabold text-xs tracking-tight uppercase",
        styles[tier],
        className
      )}
    >
      <span className="text-base leading-none">{pct}%</span>
      <span className="text-[10px] font-mono opacity-80">{label}</span>
    </span>
  );
};

export default DiscountChip;
