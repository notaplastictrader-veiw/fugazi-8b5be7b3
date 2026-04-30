import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { initGA, trackPageView, hasConsent } from "@/lib/analytics";

/**
 * Mounts inside <BrowserRouter>. Initializes GA4 once consent is granted
 * and fires a page_view event on every SPA route/search change.
 */
const AnalyticsTracker = () => {
  const location = useLocation();

  // Init on mount (no-op without consent), and react to consent changes.
  useEffect(() => {
    if (hasConsent()) initGA();

    const onConsentChanged = () => {
      if (hasConsent()) {
        initGA();
        // Fire a page_view for the current page right after init
        trackPageView(window.location.pathname + window.location.search);
      }
    };

    window.addEventListener("cookie-consent-changed", onConsentChanged);
    return () =>
      window.removeEventListener("cookie-consent-changed", onConsentChanged);
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
