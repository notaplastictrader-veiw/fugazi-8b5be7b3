import { ReactNode } from "react";
import { Lock, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useProStatus } from "@/hooks/useProStatus";
import { cn } from "@/lib/utils";

interface ProGateProps {
  children: ReactNode;
  feature?: string;
  className?: string;
  variant?: "blur" | "card";
}

export function ProGate({ children, feature = "this feature", className, variant = "blur" }: ProGateProps) {
  const { isPro, loading } = useProStatus();
  if (loading || isPro) return <>{children}</>;

  if (variant === "card") {
    return (
      <div className={cn("glass-card border border-primary/20 p-6 text-center", className)}>
        <Sparkles className="h-6 w-6 text-primary mx-auto mb-2" />
        <p className="text-sm font-mono uppercase tracking-wider text-muted-foreground mb-3">
          NAFT Pro · {feature}
        </p>
        <Button asChild size="sm">
          <Link to="/pro">Unlock with Pro</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className={cn("relative", className)}>
      <div className="pointer-events-none select-none blur-sm opacity-40">{children}</div>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-background/40 backdrop-blur-sm">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-primary">
          <Lock className="h-3.5 w-3.5" /> NAFT Pro
        </div>
        <Button asChild size="sm">
          <Link to="/pro">Unlock {feature}</Link>
        </Button>
      </div>
    </div>
  );
}

export function ProBadge({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full bg-primary/15 text-primary px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider", className)}>
      <Sparkles className="h-3 w-3" /> Pro
    </span>
  );
}
