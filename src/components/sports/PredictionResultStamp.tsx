interface PredictionResultStampProps {
  /** "winner" | "loser" | "draw" — controls color + label */
  variant: "winner" | "loser" | "draw";
  className?: string;
}

const VARIANTS = {
  winner: { label: "WINNER", stroke: "rgb(34,197,94)", curve: "• PREDICTION RESULT •" },
  loser: { label: "LOSER", stroke: "rgb(220,38,38)", curve: "• PREDICTION RESULT •" },
  draw: { label: "DRAW", stroke: "rgb(234,179,8)", curve: "• PREDICTION RESULT •" },
} as const;

/**
 * Circular rubber-stamp seal for prediction outcome (winner / loser / draw).
 * Drop into a `relative` parent.
 */
const PredictionResultStamp = ({ variant, className = "" }: PredictionResultStampProps) => {
  const { label, stroke, curve } = VARIANTS[variant];

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute top-2 right-2 md:top-3 md:right-3 z-20 select-none ${className}`}
    >
      <svg
        viewBox="0 0 200 200"
        className="w-20 h-20 md:w-24 md:h-24 opacity-85 mix-blend-multiply dark:mix-blend-screen"
        style={{
          transform: "rotate(-14deg)",
          filter: `drop-shadow(0 1px 0 ${stroke}40)`,
        }}
      >
        <defs>
          <path id={`res-arc-top-${variant}`} d="M 30,100 A 70,70 0 0 1 170,100" fill="none" />
          <path id={`res-arc-bottom-${variant}`} d="M 32,108 A 68,68 0 0 0 168,108" fill="none" />
        </defs>

        <circle cx="100" cy="100" r="88" fill="none" stroke={stroke} strokeWidth="4" />
        <circle cx="100" cy="100" r="78" fill="none" stroke={stroke} strokeWidth="2" />

        <text fill={stroke} fontSize="14" fontWeight="800" letterSpacing="3">
          <textPath href={`#res-arc-top-${variant}`} startOffset="50%" textAnchor="middle">
            {curve}
          </textPath>
        </text>
        <text fill={stroke} fontSize="14" fontWeight="800" letterSpacing="3">
          <textPath href={`#res-arc-bottom-${variant}`} startOffset="50%" textAnchor="middle">
            {curve}
          </textPath>
        </text>

        <g>
          <rect x="14" y="84" width="172" height="34" fill={stroke} />
          <polygon points="14,84 4,94 14,104" fill={stroke} opacity="0.85" />
          <polygon points="186,98 196,108 186,118" fill={stroke} opacity="0.85" />
          <text
            x="100"
            y="107"
            textAnchor="middle"
            fill="#fff"
            fontSize="24"
            fontWeight="900"
            letterSpacing="4"
          >
            {label}
          </text>
        </g>

        <g fill={stroke} opacity="0.55">
          <circle cx="60" cy="50" r="1.5" />
          <circle cx="145" cy="55" r="1" />
          <circle cx="50" cy="140" r="1.2" />
          <circle cx="155" cy="145" r="1.6" />
          <circle cx="100" cy="40" r="1" />
          <circle cx="100" cy="160" r="1.2" />
        </g>
      </svg>
    </div>
  );
};

export default PredictionResultStamp;
