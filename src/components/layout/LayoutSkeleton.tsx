import { Skeleton } from "@/components/ui/skeleton";

/**
 * Lightweight chrome skeleton matching MainLayout dimensions exactly.
 * Used as Suspense fallback for public routes so navbar/promo/ticker
 * never disappear during lazy chunk load (kills the 400ms flash).
 */
const LayoutSkeleton = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Top chrome (PromoTicker 34px + Navbar 58px = 92px) */}
      <div className="fixed top-0 left-0 right-0 z-[200]">
        <div className="h-[34px] bg-primary/10 border-b border-primary/20" />
        <div className="h-[58px] bg-background/90 backdrop-blur-md border-b border-border flex items-center px-4 gap-4">
          <Skeleton className="h-6 w-24" />
          <div className="flex-1" />
          <Skeleton className="h-6 w-16 hidden md:block" />
          <Skeleton className="h-6 w-16 hidden md:block" />
          <Skeleton className="h-8 w-20" />
        </div>
      </div>

      {/* Content skeleton */}
      <main className="flex-1 pb-[32px]" style={{ paddingTop: "92px" }}>
        <div className="max-w-7xl mx-auto px-4 py-12 space-y-6">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-4 w-2/3" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-48 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </main>

      {/* Bottom ticker (32px) */}
      <div className="fixed bottom-0 left-0 right-0 z-[200] h-[32px] bg-background/90 border-t border-border" />
    </div>
  );
};

export default LayoutSkeleton;
