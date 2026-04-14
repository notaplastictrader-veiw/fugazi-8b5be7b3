import { Shield, ShieldCheck, Crown } from "lucide-react";

type Tier = "basic" | "verified" | "featured";

const tierConfig: Record<Tier, { label: string; icon: typeof Shield; className: string }> = {
  basic: {
    label: "Basic",
    icon: Shield,
    className: "bg-muted/50 text-muted-foreground border-border/50",
  },
  verified: {
    label: "Verified",
    icon: ShieldCheck,
    className: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  },
  featured: {
    label: "Featured",
    icon: Crown,
    className: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  },
};

interface BrokerTierBadgeProps {
  tier: string;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

const BrokerTierBadge = ({ tier, size = "sm", showLabel = true }: BrokerTierBadgeProps) => {
  const config = tierConfig[(tier as Tier) || "basic"] || tierConfig.basic;
  const Icon = config.icon;
  const sizeMap = { sm: "h-3 w-3", md: "h-4 w-4", lg: "h-5 w-5" };
  const textMap = { sm: "text-[10px]", md: "text-xs", lg: "text-sm" };

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border font-mono uppercase tracking-wider ${textMap[size]} ${config.className}`}>
      <Icon className={sizeMap[size]} />
      {showLabel && config.label}
    </span>
  );
};

export default BrokerTierBadge;
