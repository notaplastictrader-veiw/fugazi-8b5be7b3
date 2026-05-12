import { ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  verified?: boolean;
  hasProof?: boolean;
  hasAccountId?: boolean;
  size?: "sm" | "md";
  className?: string;
}

/**
 * Verified-Depositor chip.
 * - "Verified Depositor" (green) when admin has stamped verified_account = true
 * - "Proof Submitted" (accent) when proof OR masked account ID exists but not yet verified
 * - Renders nothing otherwise
 */
const VerifiedDepositorBadge = ({
  verified,
  hasProof,
  hasAccountId,
  size = "sm",
  className,
}: Props) => {
  const tier: "verified" | "pending" | null = verified
    ? "verified"
    : hasProof || hasAccountId
    ? "pending"
    : null;

  if (!tier) return null;

  const cfg = {
    verified: {
      bg: "bg-primary/10 border-primary/30 text-primary",
      label: "Verified Depositor",
    },
    pending: {
      bg: "bg-accent/10 border-accent/30 text-accent",
      label: "Proof Submitted",
    },
  } as const;

  const { bg, label } = cfg[tier];
  const px = size === "md" ? "px-2.5 py-1 text-[11px]" : "px-2 py-0.5 text-[10px]";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 font-mono font-semibold uppercase tracking-wider rounded-full border",
        bg,
        px,
        className,
      )}
      title={
        tier === "verified"
          ? "This trader's broker account & deposit have been verified by NAFT moderators."
          : "Account proof or ID submitted — pending NAFT verification."
      }
    >
      <ShieldCheck className={size === "md" ? "w-3.5 h-3.5" : "w-3 h-3"} />
      {label}
    </span>
  );
};

export default VerifiedDepositorBadge;
