import { useCallback } from "react";
import { trackEvent } from "@/lib/analytics";

/**
 * Hook for manually tracking GA4 events.
 *
 * @example
 *   const track = useTrackEvent();
 *   track("contact_click", { button: "submit" });
 */
export const useTrackEvent = () => {
  return useCallback(
    (eventName: string, params: Record<string, unknown> = {}) => {
      trackEvent(eventName, params);
    },
    []
  );
};

export default useTrackEvent;
