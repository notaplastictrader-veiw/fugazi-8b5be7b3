import { Skeleton } from "@/components/ui/skeleton";

interface ListingSkeletonProps {
  count?: number;
  /** Tailwind grid classes — must match the real listing grid for layout stability. */
  gridClassName?: string;
  /** Card height token (tailwind h-*). */
  cardHeight?: string;
}

/**
 * Generic skeleton grid used by listing pages (Brokers, PropFirms, Signals) while
 * the first Supabase fetch is in flight. Eliminates the empty-state flash.
 */
const ListingSkeleton = ({
  count = 6,
  gridClassName = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4",
  cardHeight = "h-56",
}: ListingSkeletonProps) => (
  <div className={gridClassName} aria-busy="true" aria-live="polite">
    {Array.from({ length: count }).map((_, i) => (
      <Skeleton key={i} className={`${cardHeight} rounded-2xl`} />
    ))}
  </div>
);

export default ListingSkeleton;
