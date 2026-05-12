import { cn } from "@/lib/utils";

interface TrustLightProps {
  score: number | null;
  complaints?: number | null;
  size?: "sm" | "md";
  showLabel?: boolean;
  className?: string;
}

/**
 * Traffic-light trust indicator derived from score + complaints.
 * Green = trusted, Yellow = caution, Red = high risk.
 */
const TrustLight = ({
  score,
  complaints = 0,
  size = "sm",
  showLabel = true,
  className,
}: TrustLightProps) => {
  const s = score ?? 0;
  const c = complaints ?? 0;

  const tier =
    s >= 7.5 && c < 10 ? "green" : s >= 5 && c < 25 ? "yellow" : "red";

  const config = {
    green: { color: "bg-primary", label: "Trusted", text: "text-primary" },
    yellow: { color: "bg-accent", label: "Caution", text: "text-accent" },
    red: { color: "bg-destructive", label: "High Risk", text: "text-destructive" },
  } as const;

  const { color, label, text } = config[tier];
  const dot = size === "md" ? "w-2.5 h-2.5" : "w-2 h-2";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-[10px] font-mono font-semibold uppercase tracking-wider",
        text,
        className
      )}
      title={`Trust: ${label} (Score ${s}/10, ${c} complaints)`}
    >
      <span className={cn("rounded-full pulse-dot", color, dot)} />
      {showLabel && label}
    </span>
  );
};

export default TrustLight;
