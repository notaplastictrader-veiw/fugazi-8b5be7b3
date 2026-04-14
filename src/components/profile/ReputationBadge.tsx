import { getTierColor, getTierBg, type ReputationTier } from "@/hooks/useReputation";
import { Star } from "lucide-react";

interface ReputationBadgeProps {
  score: number;
  tier: ReputationTier | string;
  size?: "sm" | "md";
}

const ReputationBadge = ({ score, tier, size = "md" }: ReputationBadgeProps) => {
  const isSmall = size === "sm";

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${getTierBg(tier)} ${isSmall ? "text-[10px]" : "text-xs"} font-semibold`}>
      <Star className={`${isSmall ? "w-3 h-3" : "w-3.5 h-3.5"} ${getTierColor(tier)} fill-current`} />
      <span className={getTierColor(tier)}>{tier}</span>
      <span className="text-muted-foreground">·</span>
      <span className="text-foreground">{score}/100</span>
    </div>
  );
};

export default ReputationBadge;
