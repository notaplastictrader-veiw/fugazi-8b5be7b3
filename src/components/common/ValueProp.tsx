import { FlaskConical } from "lucide-react";

interface ValuePropProps {
  variant?: "inline" | "stacked" | "badge";
  className?: string;
}

/**
 * Brand value proposition: "We Test Brokers. You Trade Smarter."
 * Reusable across hero, footer, proof sections.
 */
const ValueProp = ({ variant = "inline", className = "" }: ValuePropProps) => {
  if (variant === "badge") {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/8 ${className}`}>
        <FlaskConical className="w-3.5 h-3.5 text-primary" />
        <span className="text-xs font-mono font-semibold tracking-wider uppercase text-primary">
          We Test. You Trade Smarter.
        </span>
      </div>
    );
  }

  if (variant === "stacked") {
    return (
      <div className={`flex flex-col gap-1 ${className}`}>
        <span className="text-base md:text-lg font-display font-bold text-foreground leading-snug">
          We Test Brokers.
        </span>
        <span className="text-base md:text-lg font-display font-bold text-primary leading-snug">
          You Trade Smarter.
        </span>
      </div>
    );
  }

  return (
    <p className={`text-base md:text-lg font-display font-semibold leading-snug ${className}`}>
      <span className="text-foreground">We Test Brokers.</span>{" "}
      <span className="text-primary">You Trade Smarter.</span>
    </p>
  );
};

export default ValueProp;
