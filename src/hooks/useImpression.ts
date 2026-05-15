import { useEffect, useRef } from "react";
import { trackEvent } from "@/lib/analytics";

/**
 * Fires a GA event the first time the element is ≥50% visible.
 * Use for sponsor impressions, hero CTA visibility, etc.
 */
export const useImpression = (
  eventName: string,
  params: Record<string, unknown> = {},
  threshold = 0.5
) => {
  const ref = useRef<HTMLElement | null>(null);
  const fired = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || fired.current) return;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && !fired.current) {
            fired.current = true;
            trackEvent(eventName, params);
            obs.disconnect();
          }
        }
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [eventName, threshold, JSON.stringify(params)]);

  return ref;
};

export default useImpression;
