import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  verified?: boolean | null;
  entityLabel?: string; // e.g. "broker", "prop firm", "signal group"
  className?: string;
}

/**
 * "Heads up — still being verified by NAFT" disclaimer.
 * Renders only when `verified` is falsy.
 */
const NaftVerificationBanner = ({ verified, entityLabel = "listing", className }: Props) => {
  if (verified) return null;
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-lg border border-accent/30 bg-accent/10 px-4 py-3 text-sm",
        className
      )}
      role="note"
    >
      <Info className="h-4 w-4 mt-0.5 shrink-0 text-accent" />
      <p className="text-muted-foreground leading-relaxed">
        <span className="font-semibold text-foreground">Heads up —</span> this {entityLabel} is still being verified by NAFT.
        Some details may not be 100% accurate. Always cross-check with the company directly or other trusted sources before making a decision.
      </p>
    </div>
  );
};

export default NaftVerificationBanner;
