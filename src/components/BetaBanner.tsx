import { useEffect, useState } from "react";
import { X, Wrench } from "lucide-react";

const STORAGE_KEY = "naft_beta_banner_dismissed_v1";

const BetaBanner = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const check = () => {
      const dismissed = sessionStorage.getItem(STORAGE_KEY);
      const consent = localStorage.getItem("cookie_consent");
      // Only show after the user has made a cookie decision
      if (!dismissed && consent) setVisible(true);
    };
    check();
    window.addEventListener("cookie-consent-changed", check);
    return () => window.removeEventListener("cookie-consent-changed", check);
  }, []);

  if (!visible) return null;

  const dismiss = () => {
    sessionStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  };

  return (
    <div
      role="status"
      aria-label="Site in beta"
      className="fixed top-14 md:top-24 left-4 z-[160] max-w-[220px] w-auto"
    >
      <div className="relative flex flex-col gap-1.5 px-3.5 py-2.5 rounded-xl border border-primary/40 bg-background/95 backdrop-blur-sm shadow-lg shadow-primary/10">
        <div className="flex items-center gap-2">
          <Wrench className="w-3.5 h-3.5 text-primary shrink-0" />
          <span className="text-[11px] font-mono text-primary font-semibold uppercase tracking-wider">
            Beta
          </span>
        </div>
        <p className="text-[11px] leading-relaxed text-foreground/80 font-mono">
          NAFT is in active testing.
          <br />
          Spotted a bug?{" "}
          <a href="/contact" className="underline text-primary hover:text-primary/80 font-medium">
            Report it
          </a>
        </p>
        <button
          onClick={dismiss}
          aria-label="Dismiss beta notice"
          className="absolute top-2 right-2 text-muted-foreground hover:text-foreground transition-colors shrink-0"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

export default BetaBanner;
