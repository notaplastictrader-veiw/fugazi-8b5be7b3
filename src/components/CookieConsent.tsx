import { useState, useEffect, useCallback } from "react";
import { X, Settings } from "lucide-react";

interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  personalization: boolean;
  marketing: boolean;
}

const defaultPreferences: CookiePreferences = {
  essential: true,
  analytics: false,
  personalization: false,
  marketing: false,
};

const CONSENT_KEY = "cookie_consent"; // simple "accepted" | "rejected" gate for GA
const PREFS_KEY = "naft-cookie-consent"; // granular preferences (legacy + UI)

const dispatchConsentChanged = () => {
  try {
    window.dispatchEvent(new Event("cookie-consent-changed"));
  } catch {
    /* noop */
  }
};

const CookieConsent = () => {
  const [visible, setVisible] = useState(false);
  const [showPrefs, setShowPrefs] = useState(false);
  const [prefs, setPrefs] = useState<CookiePreferences>(defaultPreferences);

  // Show banner if no decision has been made yet.
  useEffect(() => {
    const decision = localStorage.getItem(CONSENT_KEY);
    if (!decision) {
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  // Allow the footer "Cookie Settings" link to re-open the banner.
  useEffect(() => {
    const open = () => {
      const stored = localStorage.getItem(PREFS_KEY);
      if (stored) {
        try {
          setPrefs({ ...defaultPreferences, ...JSON.parse(stored) });
        } catch {
          /* noop */
        }
      }
      setVisible(true);
      setShowPrefs(true);
    };
    window.addEventListener("open-cookie-settings", open);
    return () => window.removeEventListener("open-cookie-settings", open);
  }, []);

  const persist = useCallback(
    (decision: "accepted" | "rejected", preferences: CookiePreferences) => {
      localStorage.setItem(CONSENT_KEY, decision);
      localStorage.setItem(PREFS_KEY, JSON.stringify(preferences));
      setVisible(false);
      setShowPrefs(false);
      dispatchConsentChanged();
    },
    []
  );

  const acceptAll = () =>
    persist("accepted", {
      essential: true,
      analytics: true,
      personalization: true,
      marketing: true,
    });

  const reject = () => persist("rejected", defaultPreferences);

  const saveCustom = () => {
    // Treat as accepted only if the user enabled analytics; otherwise rejected.
    persist(prefs.analytics ? "accepted" : "rejected", prefs);
  };

  if (!visible) return null;

  return (
    <>
      {/* Preferences Modal */}
      {showPrefs && (
        <div
          className="fixed inset-0 z-[2000] flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.7)" }}
        >
          <div className="bg-card border border-border rounded-2xl w-full max-w-md p-6 relative">
            <button
              onClick={() => setShowPrefs(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
              aria-label="Close preferences"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-lg font-display font-bold text-foreground mb-4">
              Cookie Preferences
            </h3>
            <div className="space-y-4">
              {[
                { key: "essential" as const, label: "Essential", desc: "Required for the website to function", locked: true },
                { key: "analytics" as const, label: "Analytics", desc: "Help us understand how visitors use our site" },
                { key: "personalization" as const, label: "Personalization", desc: "Remember your preferences and settings" },
                { key: "marketing" as const, label: "Marketing", desc: "Used to deliver relevant advertisements" },
              ].map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between py-2 border-b border-border last:border-0"
                >
                  <div>
                    <p className="text-sm font-semibold text-foreground">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <button
                    onClick={() =>
                      !item.locked &&
                      setPrefs((p) => ({ ...p, [item.key]: !p[item.key] }))
                    }
                    className={`w-10 h-5 rounded-full relative transition-colors ${
                      prefs[item.key] ? "bg-primary" : "bg-muted"
                    } ${item.locked ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
                    aria-label={`Toggle ${item.label}`}
                  >
                    <span
                      className={`absolute top-0.5 w-4 h-4 rounded-full bg-primary-foreground transition-transform ${
                        prefs[item.key] ? "left-[22px]" : "left-0.5"
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={saveCustom}
              className="w-full mt-5 py-2.5 text-sm font-bold bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity"
            >
              Save Preferences
            </button>
          </div>
        </div>
      )}

      {/* Bottom Banner — sits above the 32px fixed ticker */}
      <div
        className="fixed left-0 right-0 z-[1900] bg-card border-t border-border p-4 shadow-2xl"
        style={{ bottom: "32px" }}
        role="dialog"
        aria-live="polite"
        aria-label="Cookie consent"
      >
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center gap-4">
          <p className="text-sm text-muted-foreground flex-1">
            We use cookies to improve your experience and analyze traffic. No analytics
            cookies are set until you accept. See our{" "}
            <a href="/cookies" className="text-primary hover:underline">
              Cookie Policy
            </a>
            .
          </p>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowPrefs(true)}
              className="px-3 py-2 text-xs font-semibold border border-border text-muted-foreground rounded-lg hover:text-foreground transition-colors flex items-center gap-1.5"
            >
              <Settings className="w-3 h-3" /> Manage
            </button>
            <button
              onClick={reject}
              className="px-3 py-2 text-xs font-semibold border border-border text-muted-foreground rounded-lg hover:text-foreground transition-colors"
            >
              Reject
            </button>
            <button
              onClick={acceptAll}
              className="px-4 py-2 text-xs font-bold bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
            >
              Accept All
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CookieConsent;
