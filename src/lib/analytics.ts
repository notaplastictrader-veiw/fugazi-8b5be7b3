// Google Analytics 4 (gtag.js) integration
// Set VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX in your environment to enable.

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

const MEASUREMENT_ID =
  (import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined) ||
  (import.meta.env.GA_MEASUREMENT_ID as string | undefined) ||
  "";

let initialized = false;

export const isGAEnabled = (): boolean => Boolean(MEASUREMENT_ID);

export function initGA(): void {
  if (initialized || typeof window === "undefined" || !MEASUREMENT_ID) return;
  initialized = true;

  // Inject gtag.js asynchronously
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
  document.head.appendChild(script);

  // Initialize dataLayer + gtag
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer.push(arguments);
  };
  window.gtag("js", new Date());
  // Disable automatic page_view; we send them manually on route change
  window.gtag("config", MEASUREMENT_ID, { send_page_view: false });
}

export function trackPageView(path: string): void {
  if (typeof window === "undefined" || !MEASUREMENT_ID || !window.gtag) return;
  window.gtag("event", "page_view", {
    page_path: path,
    page_location: window.location.href,
    page_title: document.title,
    send_to: MEASUREMENT_ID,
  });
}

export function trackEvent(
  eventName: string,
  params: Record<string, any> = {}
): void {
  if (typeof window === "undefined" || !MEASUREMENT_ID || !window.gtag) return;
  window.gtag("event", eventName, params);
}
