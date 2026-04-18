import { Star } from "lucide-react";

interface StarRatingProps {
  value: number;
  size?: number;
  className?: string;
}

/**
 * Renders 5 stars with half-star precision for fractional ratings.
 * e.g. value=4.5 → 4 full stars + 1 half star.
 */
const StarRating = ({ value, size = 14, className = "" }: StarRatingProps) => {
  // Round to nearest 0.5
  const rounded = Math.round(value * 2) / 2;
  const dim = `${size}px`;

  return (
    <div className={`flex items-center gap-0.5 ${className}`}>
      {Array.from({ length: 5 }).map((_, i) => {
        const starValue = i + 1;
        const isFull = rounded >= starValue;
        const isHalf = !isFull && rounded >= starValue - 0.5;
        return (
          <span key={i} className="relative inline-block" style={{ width: dim, height: dim }}>
            <Star
              className="absolute inset-0 text-border"
              style={{ width: dim, height: dim }}
            />
            {isFull && (
              <Star
                className="absolute inset-0 text-accent fill-accent"
                style={{ width: dim, height: dim }}
              />
            )}
            {isHalf && (
              <span
                className="absolute inset-0 overflow-hidden"
                style={{ width: `calc(${dim} / 2)`, height: dim }}
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
