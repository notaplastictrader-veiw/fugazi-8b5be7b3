import { useEffect, useState } from "react";
import { X, Wrench } from "lucide-react";

const STORAGE_KEY = "naft_beta_banner_dismissed_v1";

const BetaBanner = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const dismissed = sessionStorage.getItem(STORAGE_KEY);
    if (!dismissed) setVisible(true);
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
      className="fixed left-3 bottom-[96px] md:bottom-12 z-[190] max-w-[calc(100vw-1.5rem)] sm:max-w-sm"
    >
      <div className="flex items-start gap-2 px-3 py-2 rounded-md border border-primary/40 bg-background/95 backdrop-blur-sm shadow-lg">
        <Wrench className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
        <div className="text-[11px] leading-snug text-foreground/90 font-mono">
          <span className="text-primary font-semibold uppercase tracking-wider">Beta</span>
          <span className="mx-1.5 text-border">|</span>
          NAFT is in active testing. Spotted a bug or wrong data?{" "}
          <a href="/contact" className="underline text-primary hover:text-primary/80">
            Report it
          </a>{" "}
          — we'll fix it fast.
        </div>
        <button
          onClick={dismiss}
          aria-label="Dismiss beta notice"
          className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default BetaBanner;
