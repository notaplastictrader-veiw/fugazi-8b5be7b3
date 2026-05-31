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
      className={`pointer-events-none absolute inset-0 z-20 flex items-center justify-center select-none ${className}`}
    >
      <div
        className="
          relative inline-flex items-center gap-1.5
          px-4 py-2 md:px-6 md:py-3
          rounded-lg
          border-[3px] border-red-600
          text-red-600
          font-display font-extrabold tracking-[0.25em]
          text-xs md:text-sm uppercase
          rotate-[-14deg]
          shadow-lg
          bg-white
        "
        style={{
          textShadow:
            "0 0 1px rgba(220,38,38,0.6), 0 0 2px rgba(220,38,38,0.3)",
        }}
      >
        <ShieldAlert className="w-4 h-4 md:w-5 md:h-5" strokeWidth={2.5} />
        <span>{label}</span>

        {/* faux distressed dots */}
        <span className="absolute -top-1 -left-1 w-1.5 h-1.5 rounded-full bg-red-500/50" />
        <span className="absolute -bottom-1 -right-2 w-2 h-2 rounded-full bg-red-500/40" />
        <span className="absolute top-1/2 -right-3 w-1.5 h-1.5 rounded-full bg-red-500/50" />
      </div>
    </div>
  );
};

export default NotVerifiedStamp;
