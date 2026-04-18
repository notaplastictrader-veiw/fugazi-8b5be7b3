import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface TierGateProps {
  unlocked: boolean;
  requiredTier?: "verified" | "featured";
  onUpgrade?: () => void;
  children: React.ReactNode;
  /** When locked, render an inline lock pill instead of the children */
  inline?: boolean;
  message?: string;
}

const TierGate = ({ unlocked, requiredTier = "verified", onUpgrade, children, inline, message }: TierGateProps) => {
  if (unlocked) return <>{children}</>;

  const tooltipMsg = message || `Upgrade to ${requiredTier === "verified" ? "Verified" : "Featured"} to unlock`;

  if (inline) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs font-mono border-amber-500/30 text-amber-400/80 cursor-not-allowed"
              onClick={onUpgrade}
            >
              <Lock className="w-3 h-3 mr-1" /> LOCKED
            </Button>
          </TooltipTrigger>
          <TooltipContent><p className="font-mono text-xs">{tooltipMsg}</p></TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className="relative">
      <div className="opacity-40 pointer-events-none select-none">{children}</div>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-background/60 backdrop-blur-[2px] rounded">
        <Lock className="w-6 h-6 text-amber-400" />
        <p className="text-xs font-mono text-amber-400 uppercase tracking-widest">{tooltipMsg}</p>
        {onUpgrade && (
          <Button size="sm" className="font-mono text-xs h-7" onClick={onUpgrade}>UPGRADE NOW</Button>
        )}
      </div>
    </div>
  );
};

export default TierGate;
