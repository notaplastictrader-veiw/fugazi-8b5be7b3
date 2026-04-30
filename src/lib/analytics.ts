// Google Analytics 4 via react-ga4. Consent-gated: nothing loads until the
// user explicitly accepts cookies (localStorage `cookie_consent === "accepted"`).
import ReactGA from "react-ga4";

export const MEASUREMENT_ID: string =
  (import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined) ||
  (import.meta.env.GA_MEASUREMENT_ID as string | undefined) ||
  "G-4PD1ZKK0YD";

export const GA_DEBUG: boolean =
  (import.meta.env.VITE_GA_DEBUG as string | undefined) === "true";

const CONSENT_KEY = "cookie_consent";
let initialized = false;

const debug = (...args: unknown[]) => {
  if (GA_DEBUG && typeof console !== "undefined") {
    // eslint-disable-next-line no-console
    console.log("[GA4]", ...args);
  }
};

export const hasConsent = (): boolean => {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(CONSENT_KEY) === "accepted";
  } catch {
    return false;
  }
};

export const isInitialized = (): boolean => initialized;

export const initGA = (): void => {
  if (initialized) return;
  if (typeof window === "undefined") return;
  if (!MEASUREMENT_ID) return;
  if (!hasConsent()) {
    debug("init skipped — no consent");
    return;
  }

  ReactGA.initialize(MEASUREMENT_ID, {
    gaOptions: { send_page_view: false },
    testMode: false,
  });
  initialized = true;
  debug("init", MEASUREMENT_ID);
};

export const trackPageView = (path: string): void => {
  if (!initialized || !hasConsent()) return;
  const title = typeof document !== "undefined" ? document.title : undefined;
  ReactGA.send({ hitType: "pageview", page: path, title });
  debug("pageview", path);
};

export const trackEvent = (
  eventName: string,
  params: Record<string, unknown> = {}
): void => {
  if (!initialized || !hasConsent()) return;
  ReactGA.event(eventName, params as Record<string, any>);
  debug("event", eventName, params);
};

export const resetGA = (): void => {
  initialized = false;
  debug("reset");
};
