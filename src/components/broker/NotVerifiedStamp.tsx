import { ShieldAlert } from "lucide-react";

interface NotVerifiedStampProps {
  /** Show stamp when true. Hide it for verified brokers. */
  show: boolean;
  /** Optional label override */
  label?: string;
  className?: string;
}

/**
 * Diagonal "NOT VERIFIED" rubber-stamp / seal overlay.
 * Absolutely positioned — drop into a `relative` parent.
 * Non-interactive (pointer-events-none).
 */
const NotVerifiedStamp = ({
  show,
  label = "NOT VERIFIED",
  className = "",
}: NotVerifiedStampProps) => {
  if (!show) return null;

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute top-3 right-3 md:top-5 md:right-5 z-20 select-none ${className}`}
    >
      <div
        className="
          relative inline-flex items-center gap-1.5
          px-3 py-1.5 md:px-4 md:py-2
          rounded-md
          border-[2.5px] border-destructive
          text-destructive
          font-display font-extrabold tracking-[0.25em]
          text-[10px] md:text-xs uppercase
          rotate-[-14deg]
          shadow-[0_0_0_2px_hsl(var(--destructive)/0.15)]
          bg-destructive/5
          backdrop-blur-[1px]
        "
        style={{
          // subtle ink-bleed effect using layered text shadow
          textShadow:
            "0 0 1px hsl(var(--destructive) / 0.6), 0 0 2px hsl(var(--destructive) / 0.3)",
        }}
      >
        <ShieldAlert className="w-3.5 h-3.5 md:w-4 md:h-4" strokeWidth={2.5} />
        <span>{label}</span>

        {/* faux distressed dots — give it a chop-mark feel */}
        <span className="absolute -top-1 -left-1 w-1 h-1 rounded-full bg-destructive/40" />
        <span className="absolute -bottom-1 -right-2 w-1.5 h-1.5 rounded-full bg-destructive/30" />
        <span className="absolute top-1/2 -right-3 w-1 h-1 rounded-full bg-destructive/40" />
      </div>
    </div>
  );
};

export default NotVerifiedStamp;
