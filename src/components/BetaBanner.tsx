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
      className="fixed top-14 md:top-24 left-4 z-[160] max-w-[calc(100vw-1rem)] w-auto"
    >
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/50 bg-background/95 backdrop-blur-sm shadow-lg">
        <Wrench className="w-3.5 h-3.5 text-primary shrink-0" />
        <div className="text-[11px] leading-snug text-foreground/90 font-mono whitespace-nowrap overflow-hidden text-ellipsis">
          <span className="text-primary font-semibold uppercase tracking-wider">Beta</span>
          <span className="mx-1.5 text-border">|</span>
          <span className="hidden sm:inline">NAFT is in active testing. Spotted a bug?{" "}</span>
          <span className="sm:hidden">In testing.{" "}</span>
          <a href="/contact" className="underline text-primary hover:text-primary/80">
            Report it
          </a>
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
