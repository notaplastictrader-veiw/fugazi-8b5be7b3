import { useEffect, useRef, useState, ReactNode } from "react";

interface LazySectionProps {
  children: ReactNode;
  /** Min height reserved before mount to avoid CLS */
  minHeight?: number;
  /** Root margin for IntersectionObserver pre-load */
  rootMargin?: string;
}

/**
 * Defers rendering of below-fold sections until they're near the viewport.
 * Reduces initial JS execution + render cost for the homepage.
 */
const LazySection = ({ children, minHeight = 400, rootMargin = "300px" }: LazySectionProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (visible) return;
    const node = ref.current;
    if (!node) return;
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin }
    );
    io.observe(node);
    return () => io.disconnect();
  }, [visible, rootMargin]);

  return (
    <div ref={ref} style={!visible ? { minHeight } : undefined}>
      {visible ? children : null}
    </div>
  );
};

export default LazySection;
