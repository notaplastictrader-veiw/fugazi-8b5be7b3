import { useState, useEffect, useCallback } from "react";
import { X, Settings, Cookie, ChevronDown } from "lucide-react";

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

const CONSENT_KEY = "cookie_consent";
const PREFS_KEY = "naft-cookie-consent";

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

  useEffect(() => {
    const decision = localStorage.getItem(CONSENT_KEY);
    if (!decision) {
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

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
    persist(prefs.analytics ? "accepted" : "rejected", prefs);
  };

  if (!visible) return null;

  return (
    <div
      className="fixed z-[1900] left-4 right-4 sm:left-5 sm:right-auto sm:max-w-[380px] animate-in slide-in-from-bottom-4 fade-in duration-300"
      style={{ bottom: "calc(40px + env(safe-area-inset-bottom, 0px))" }}
      role="dialog"
      aria-live="polite"
      aria-label="Cookie consent"
    >
      <div className="bg-card/95 backdrop-blur-xl border border-border rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-start gap-3 p-4 pb-3">
          <div className="w-9 h-9 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0">
            <Cookie className="w-4.5 h-4.5" strokeWidth={2} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-display font-bold text-foreground leading-tight">
              Cookies on NAFT
            </p>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              We use cookies to improve your experience and analyze traffic. No analytics cookies
              load until you accept.{" "}
              <a href="/cookies" className="text-primary hover:underline">
                Learn more
              </a>
            </p>
          </div>
          <button
            onClick={reject}
            className="text-muted-foreground hover:text-foreground transition-colors shrink-0 -mt-1 -mr-1 p-1"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Inline preferences (expand, no modal) */}
        {showPrefs && (
          <div className="px-4 pb-3 border-t border-border/60 pt-3 space-y-2.5 max-h-[280px] overflow-y-auto">
            {[
              { key: "essential" as const, label: "Essential", desc: "Required for the site to function", locked: true },
              { key: "analytics" as const, label: "Analytics", desc: "Anonymous usage statistics" },
              { key: "personalization" as const, label: "Personalization", desc: "Remember your preferences" },
              { key: "marketing" as const, label: "Marketing", desc: "Relevant ads (not active)" },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-foreground">{item.label}</p>
                  <p className="text-[11px] text-muted-foreground leading-tight">{item.desc}</p>
                </div>
                <button
                  onClick={() =>
                    !item.locked && setPrefs((p) => ({ ...p, [item.key]: !p[item.key] }))
                  }
                  className={`w-9 h-5 rounded-full relative transition-colors shrink-0 ${
                    prefs[item.key] ? "bg-primary" : "bg-muted"
                  } ${item.locked ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
                  aria-label={`Toggle ${item.label}`}
                  disabled={item.locked}
                >
                  <span
                    className={`absolute top-0.5 w-4 h-4 rounded-full bg-background shadow transition-transform ${
                      prefs[item.key] ? "translate-x-[18px]" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 p-3 pt-2 border-t border-border/60 bg-secondary/20">
          <button
            onClick={() => (showPrefs ? saveCustom() : setShowPrefs(true))}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPrefs ? (
              "Save"
            ) : (
              <>
                <Settings className="w-3 h-3" /> Manage
                <ChevronDown className="w-3 h-3" />
              </>
            )}
          </button>
          <div className="flex-1" />
          <button
            onClick={reject}
            className="px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
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
  );
};

export default CookieConsent;
