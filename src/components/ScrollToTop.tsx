import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Scrolls to top on route pathname change.
 * Preserves scroll when only the hash changes (so #anchor links still work).
 */
const ScrollToTop = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) return;
    window.scrollTo({ top: 0, left: 0 });
  }, [pathname, hash]);

  return null;
};

export default ScrollToTop;
