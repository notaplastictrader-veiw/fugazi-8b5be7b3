import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface PromoCodeButtonProps {
  code: string;
  prefix?: string;
  className?: string;
}

const PromoCodeButton = ({ code, prefix = "CODE", className }: PromoCodeButtonProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success(`Code copied: ${code}`);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Could not copy code");
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={cn(
        "group inline-flex items-center gap-2 px-3 py-1.5 rounded-md",
        "border border-dashed border-primary/40 bg-primary/5",
        "hover:border-primary/70 hover:bg-primary/10 transition-all",
        "font-mono text-xs",
        className
      )}
    >
      <span className="text-[10px] font-semibold text-muted-foreground tracking-wider">
        {prefix}
      </span>
      <span className="font-bold text-primary tracking-wider">{code}</span>
      {copied ? (
        <Check className="w-3.5 h-3.5 text-primary" />
      ) : (
        <Copy className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
      )}
    </button>
  );
};

export default PromoCodeButton;
