import { ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  verified?: boolean | null;
  className?: string;
}

const NaftVerifiedBadge = ({ verified, className }: Props) => {
  if (!verified) return null;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider rounded-full border border-primary/40 bg-primary/10 text-primary",
        className
      )}
      title="Personally fact-checked by NAFT"
    >
      <ShieldCheck className="h-3 w-3" /> NAFT Verified
    </span>
  );
};

export default NaftVerifiedBadge;
