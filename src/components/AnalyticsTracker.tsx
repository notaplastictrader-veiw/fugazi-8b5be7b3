import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { initGA, trackPageView } from "@/lib/analytics";

/**
 * Mounts inside <BrowserRouter>. Initializes GA4 once and fires
 * a page_view event on every SPA route/search change.
 */
const AnalyticsTracker = () => {
  const location = useLocation();

  useEffect(() => {
    initGA();
  }, []);

  useEffect(() => {
    // Defer slightly so document.title (set by SEO components) updates first
    const id = window.setTimeout(() => {
      trackPageView(location.pathname + location.search);
    }, 0);
    return () => window.clearTimeout(id);
  }, [location.pathname, location.search]);

  return null;
};

export default AnalyticsTracker;
