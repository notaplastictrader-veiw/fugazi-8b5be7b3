import { useState, useEffect, useRef, useCallback, ReactNode, Children } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CardCarouselProps {
  children: ReactNode;
  /** Items visible per slide on desktop (default 6). Mobile = 1, tablet = 2-3. */
  itemsPerView?: number;
  /** Min card width fallback in px. Default 200. */
  itemMinWidth?: number;
  className?: string;
  showDots?: boolean;
}

/**
 * Drop-in replacement for `<div className="grid grid-cols-X gap-Y">`.
 * Renders children in a horizontal snap-scroll carousel showing
 * `itemsPerView` cards per page on desktop, with prev/next arrows + dots.
 */
const CardCarousel = ({
  children,
  itemsPerView = 6,
  itemMinWidth = 200,
  className = "",
  showDots = true,
}: CardCarouselProps) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const items = Children.toArray(children);
  const [page, setPage] = useState(0);
  const [pageCount, setPageCount] = useState(1);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const recalc = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const w = el.clientWidth;
    const sw = el.scrollWidth;
    const sl = el.scrollLeft;
    const pages = Math.max(1, Math.ceil(sw / w));
    setPageCount(pages);
    setPage(Math.min(pages - 1, Math.round(sl / w)));
    setCanPrev(sl > 4);
    setCanNext(sl + w < sw - 4);
  }, []);

  useEffect(() => {
    recalc();
    const el = trackRef.current;
    if (!el) return;
    const onScroll = () => recalc();
    el.addEventListener("scroll", onScroll, { passive: true });
    const ro = new ResizeObserver(recalc);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", onScroll);
      ro.disconnect();
    };
  }, [recalc, items.length]);

  const scrollByPage = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth, behavior: "smooth" });
  };

  const goToPage = (p: number) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollTo({ left: p * el.clientWidth, behavior: "smooth" });
  };

  return (
    <div className="relative group/carousel">
      {/* Track */}
      <div
        ref={trackRef}
        className={`flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide scroll-smooth -mx-1 px-1 ${className}`}
        style={{ scrollbarWidth: "none" }}
      >
        {items.map((child, i) => (
          <div
            key={i}
            className="snap-start shrink-0"
            style={{ minWidth: itemMinWidth, flex: `0 0 calc(${100 / Math.max(1, Math.floor(800 / itemMinWidth))}% - 1rem)` }}
          >
            {child}
          </div>
        ))}
      </div>

      {/* Arrows */}
      {canPrev && (
        <button
          onClick={() => scrollByPage(-1)}
          aria-label="Previous"
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 w-10 h-10 rounded-full bg-card/95 backdrop-blur border border-border shadow-lg text-foreground hover:text-primary hover:border-primary/50 transition-all opacity-0 group-hover/carousel:opacity-100 hidden sm:flex items-center justify-center"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      )}
      {canNext && (
        <button
          onClick={() => scrollByPage(1)}
          aria-label="Next"
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10 w-10 h-10 rounded-full bg-card/95 backdrop-blur border border-border shadow-lg text-foreground hover:text-primary hover:border-primary/50 transition-all opacity-0 group-hover/carousel:opacity-100 hidden sm:flex items-center justify-center"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      )}

      {/* Dots */}
      {showDots && pageCount > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-5">
          {Array.from({ length: pageCount }).map((_, i) => (
            <button
              key={i}
              onClick={() => goToPage(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-1.5 rounded-full transition-all ${
                i === page ? "w-6 bg-primary" : "w-1.5 bg-border hover:bg-muted-foreground"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CardCarousel;
