import { Star } from "lucide-react";

interface StarRatingProps {
  value: number;
  size?: number;
  className?: string;
}

/**
 * Renders 5 stars with exact fractional fill.
 * e.g. value=4.8 → 4 full stars + 80% of the 5th star.
 */
const StarRating = ({ value, size = 14, className = "" }: StarRatingProps) => {
  const safeValue = Math.min(5, Math.max(0, Number(value) || 0));
  const dim = `${size}px`;

  return (
    <div className={`flex items-center gap-0.5 ${className}`}>
      {Array.from({ length: 5 }).map((_, i) => {
        const fillPercent = Math.min(100, Math.max(0, (safeValue - i) * 100));
        return (
          <span key={i} className="relative inline-block" style={{ width: dim, height: dim }}>
            <Star
              className="absolute inset-0 text-border"
              style={{ width: dim, height: dim }}
            />
            {fillPercent > 0 && (
              <span
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${fillPercent}%`, height: dim }}
              >
                <Star
                  className="text-accent fill-accent"
                  style={{ width: dim, height: dim }}
                />
              </span>
            )}
          </span>
        );
      })}
    </div>
  );
};

export default StarRating;
