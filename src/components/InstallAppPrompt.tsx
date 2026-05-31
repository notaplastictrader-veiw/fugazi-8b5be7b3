import { useEffect, useState } from "react";
import { Download, Share, Plus, X, Zap, Bell, Smartphone, Monitor, Apple } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTrackEvent } from "@/hooks/useTrackEvent";

const STORAGE_KEY = "naft_install_prompt_dismissed";

type Platform = "ios" | "android" | "desktop";
type Browser = "safari" | "chromium" | "firefox" | "other";

function detectPlatform(): Platform {
  const ua = navigator.userAgent || "";
  if (/iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream) return "ios";
  if (/Android/i.test(ua)) return "android";
  return "desktop";
}

function detectBrowser(): Browser {
  const ua = navigator.userAgent || "";
  if (/CriOS|FxiOS|EdgiOS/.test(ua)) return "other"; // iOS non-Safari
  if (/Safari/.test(ua) && !/Chrome|Chromium|Edg/.test(ua)) return "safari";
  if (/Firefox/.test(ua)) return "firefox";
  if (/Chrome|Chromium|Edg|Brave|OPR/.test(ua)) return "chromium";
  return "other";
}

function isStandalone(): boolean {
  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    (window.navigator as any).standalone === true
  );
}

export default function InstallAppPrompt() {
  const [open, setOpen] = useState(false);
  const [showFab, setShowFab] = useState(false);
  const [platform, setPlatform] = useState<Platform>("desktop");
  const [browser, setBrowser] = useState<Browser>("chromium");
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const track = useTrackEvent();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isStandalone()) return;

    setPlatform(detectPlatform());
    setBrowser(detectBrowser());

    const maybeShowFab = () => {
      // Wait for cookie consent decision before competing for screen real estate
      const consent = localStorage.getItem("cookie_consent");
      if (!consent) return;

      // Respect dismissed state — re-surface after 7 days
      const dismissedAt = Number(localStorage.getItem(STORAGE_KEY) || 0);
      const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
      if (dismissedAt && Date.now() - dismissedAt < SEVEN_DAYS) return;

      setShowFab(true);
    };
    maybeShowFab();
    window.addEventListener("cookie-consent-changed", maybeShowFab);

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    const onAppInstalled = () => {
      track("pwa_installed", {});
      setOpen(false);
      setShowFab(false);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onAppInstalled);
    return () => {
      window.removeEventListener("cookie-consent-changed", maybeShowFab);
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, [track]);

  const openPrompt = () => {
    track("install_prompt_opened", { platform, browser });
    setOpen(true);
  };

  const triggerNativeInstall = async () => {
    if (!deferredPrompt) return;
    track("install_prompt_native_triggered", { platform });
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    track("install_prompt_native_outcome", { platform, outcome });
    if (outcome === "accepted") {
      setOpen(false);
      setShowFab(false);
    }
    setDeferredPrompt(null);
  };

  const dismissFab = () => {
    track("install_prompt_dismissed", { platform });
    localStorage.setItem(STORAGE_KEY, String(Date.now()));
    setShowFab(false);
  };

  if (isStandalone()) return null;

  const hasNativePrompt = !!deferredPrompt;
  const isIOS = platform === "ios";
  const needsSafariNotice = isIOS && browser !== "safari";
  const showGuide = isIOS || (!hasNativePrompt && !isIOS);

  const PlatformIcon = isIOS ? Apple : platform === "desktop" ? Monitor : Smartphone;
  const platformLabel = isIOS ? "iPhone / iPad" : platform === "desktop" ? "Desktop" : "Android";

  return (
    <>
      {showFab && (
        <div className="fixed bottom-24 right-4 z-[160] md:bottom-14 md:right-24 flex items-center gap-2">
          <button
            onClick={openPrompt}
            className="flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-primary-foreground shadow-lg hover:opacity-90 transition-opacity text-sm font-semibold"
            aria-label="Install app"
          >
            <Download className="w-4 h-4" />
            <span>Install App</span>
          </button>
          <button
            onClick={dismissFab}
            className="rounded-full bg-muted text-muted-foreground p-1.5 shadow hover:bg-muted/80"
            aria-label="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm p-0 overflow-hidden">
          {/* Hero */}
          <div className="px-6 pt-7 pb-5 text-center bg-gradient-to-b from-primary/10 to-transparent">
            <div className="mx-auto w-20 h-20 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg mb-4">
              <span className="font-display text-3xl font-black tracking-tight">N</span>
            </div>
            <DialogHeader className="space-y-1">
              <p className="text-[11px] font-bold tracking-[0.2em] text-primary uppercase">Install App</p>
              <DialogTitle className="text-xl font-bold">Get the NAFT App</DialogTitle>
              <DialogDescription className="text-xs">
                Free • No app store • Installs in seconds
              </DialogDescription>
            </DialogHeader>
          </div>

          {/* Features */}
          <div className="px-6 space-y-3">
            <FeatureRow icon={<Zap className="w-4 h-4" />} title="Instant access" desc="One-tap launch from your home screen" />
            <FeatureRow icon={<Bell className="w-4 h-4" />} title="Live alerts" desc="Real-time scam alerts & broker updates" />
            <FeatureRow icon={<PlatformIcon className="w-4 h-4" />} title="Native experience" desc={`Full-screen app on ${platformLabel}`} />
          </div>

          {/* CTA */}
          <div className="px-6 pt-5 pb-3 space-y-2">
            {hasNativePrompt && (
              <Button onClick={triggerNativeInstall} className="w-full h-11 text-base font-semibold" size="lg">
                <Download className="w-4 h-4 mr-2" />
                Add to {platform === "desktop" ? "Desktop" : "Device"}
              </Button>
            )}

            {needsSafariNotice && (
              <div className="rounded-md bg-muted/60 border border-border px-3 py-2 text-xs text-muted-foreground">
                Open this site in <strong className="text-foreground">Safari</strong> to install on iPhone/iPad.
              </div>
            )}

            {!hasNativePrompt && !isIOS && (
              <div className="rounded-md bg-muted/60 border border-border px-3 py-2 text-xs text-muted-foreground">
                Install isn't available in this browser. Try <strong className="text-foreground">Chrome</strong> or <strong className="text-foreground">Edge</strong>.
              </div>
            )}
          </div>

          {/* Guide (iOS or fallback) */}
          {showGuide && (
            <div className="px-6 pb-6">
              <details className="group" open={isIOS}>
                <summary className="cursor-pointer list-none text-xs font-semibold text-muted-foreground hover:text-foreground flex items-center justify-between py-2 border-t border-border">
                  <span>How to install manually</span>
                  <span className="text-[10px] group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <ol className="space-y-2.5 text-xs mt-3">
                  {isIOS ? (
                    <>
                      <Step n={1}>
                        Tap the <Share className="w-3.5 h-3.5 inline text-primary mx-0.5" /> <strong>Share</strong> button in Safari.
                      </Step>
                      <Step n={2}>
                        Scroll down, tap <Plus className="w-3.5 h-3.5 inline text-primary mx-0.5" /> <strong>Add to Home Screen</strong>.
                      </Step>
                      <Step n={3}>Tap <strong>Add</strong> — NAFT appears on your home screen.</Step>
                    </>
                  ) : platform === "desktop" ? (
                    <>
                      <Step n={1}>Click the <strong>install icon</strong> (⊕) in the address bar.</Step>
                      <Step n={2}>Or open the browser menu → <strong>Install NAFT</strong>.</Step>
                      <Step n={3}>Confirm <strong>Install</strong> — NAFT opens as a desktop app.</Step>
                    </>
                  ) : (
                    <>
                      <Step n={1}>Open the browser <strong>menu</strong> (⋮).</Step>
                      <Step n={2}>Tap <strong>Install app</strong> or <strong>Add to Home screen</strong>.</Step>
                      <Step n={3}>Confirm — NAFT lands in your app drawer.</Step>
                    </>
                  )}
                </ol>
              </details>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function FeatureRow({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex-none w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold leading-tight">{title}</p>
        <p className="text-xs text-muted-foreground leading-snug">{desc}</p>
      </div>
    </div>
  );
}

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className="flex gap-2.5">
      <span className="flex-none w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">{n}</span>
      <span className="flex-1 leading-relaxed">{children}</span>
    </li>
  );
}
