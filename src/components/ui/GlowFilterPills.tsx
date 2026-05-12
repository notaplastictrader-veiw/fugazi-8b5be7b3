import { cn } from "@/lib/utils";

interface GlowFilterPillsProps {
  options: string[];
  value: string;
  onChange: (v: string) => void;
  accent?: "primary" | "accent";
  className?: string;
}

/**
 * Glowing outline filter pills. Replaces flat outline buttons site-wide.
 */
const GlowFilterPills = ({
  options,
  value,
  onChange,
  accent = "primary",
  className,
}: GlowFilterPillsProps) => {
  const isPrimary = accent === "primary";
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {options.map((opt) => {
        const active = opt === value;
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={cn(
              "px-4 py-1.5 text-xs font-mono rounded-full border transition-all duration-200",
              active
                ? isPrimary
                  ? "bg-primary text-primary-foreground border-primary shadow-[0_0_16px_hsl(var(--primary)/0.45)]"
                  : "bg-accent text-accent-foreground border-accent shadow-[0_0_16px_hsl(var(--accent)/0.45)]"
                : isPrimary
                ? "text-muted-foreground border-border hover:border-primary/60 hover:text-primary hover:shadow-[0_0_10px_hsl(var(--primary)/0.20)]"
                : "text-muted-foreground border-border hover:border-accent/60 hover:text-accent hover:shadow-[0_0_10px_hsl(var(--accent)/0.20)]"
            )}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
};

export default GlowFilterPills;
