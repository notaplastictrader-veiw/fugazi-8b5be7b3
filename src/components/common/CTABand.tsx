import { Link } from "react-router-dom";
import { ArrowRight, LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CTABandProps {
  eyebrow?: string;
  title: string;
  description?: string;
  primaryLabel: string;
  primaryTo: string;
  secondaryLabel?: string;
  secondaryTo?: string;
  icon?: LucideIcon;
  variant?: "primary" | "destructive" | "accent";
}

const variantStyles = {
  primary: "from-primary/15 via-primary/5 to-transparent border-primary/20",
  destructive: "from-destructive/15 via-destructive/5 to-transparent border-destructive/20",
  accent: "from-accent/15 via-accent/5 to-transparent border-accent/20",
};

const buttonVariants = {
  primary: "bg-primary text-primary-foreground hover:bg-primary/90",
  destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
  accent: "bg-accent text-accent-foreground hover:bg-accent/90",
};

const CTABand = ({
  eyebrow,
  title,
  description,
  primaryLabel,
  primaryTo,
  secondaryLabel,
  secondaryTo,
  icon: Icon,
  variant = "primary",
}: CTABandProps) => {
  return (
    <div
      className={`relative rounded-2xl border bg-gradient-to-r ${variantStyles[variant]} px-5 py-5 md:px-7 md:py-6 mb-8 overflow-hidden`}
    >
      <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
        <div className="flex-1 min-w-0">
          {eyebrow && (
            <span className="inline-block text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1">
              {eyebrow}
            </span>
          )}
          <h2 className="text-lg md:text-xl font-display font-extrabold text-foreground leading-tight flex items-center gap-2">
            {Icon && <Icon className="w-5 h-5 text-primary shrink-0" />}
            {title}
          </h2>
          {description && (
            <p className="text-xs md:text-sm text-muted-foreground mt-1 max-w-2xl">{description}</p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link to={primaryTo}>
            <Button className={`${buttonVariants[variant]} font-semibold gap-1`}>
              {primaryLabel} <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          {secondaryLabel && secondaryTo && (
            <Link
              to={secondaryTo}
              className="text-xs font-mono uppercase text-muted-foreground hover:text-foreground transition-colors"
            >
              {secondaryLabel}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default CTABand;
