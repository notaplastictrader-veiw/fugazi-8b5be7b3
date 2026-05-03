import { useEffect, useState } from "react";
import { Download, Share, Plus, MoreVertical, X, Smartphone } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useTrackEvent } from "@/hooks/useTrackEvent";

const STORAGE_KEY = "naft_install_prompt_dismissed";

type Platform = "ios" | "android" | "desktop";

function detectPlatform(): Platform {
  const ua = navigator.userAgent || "";
  if (/iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream) return "ios";
  if (/Android/i.test(ua)) return "android";
  return "desktop";
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
  const [platform, setPlatform] = useState<Platform>("ios");
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const track = useTrackEvent();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isStandalone()) return;

    const p = detectPlatform();
    setPlatform(p === "desktop" ? "ios" : p);

    const dismissed = localStorage.getItem(STORAGE_KEY);
    // Only auto-show floating button on mobile
    if (p !== "desktop" && !dismissed) {
      setShowFab(true);
    } else if (p !== "desktop") {
      // user dismissed — still show subtle FAB after delay
      setShowFab(true);
    }

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    const onAppInstalled = () => {
      track("pwa_installed", { platform: p, method: "appinstalled_event" });
      setOpen(false);
      setShowFab(false);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onAppInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, [track]);

  const openPrompt = () => {
    track("install_prompt_opened", { platform });
    setOpen(true);
  };

  const handleAndroidInstall = async () => {
    if (deferredPrompt) {
      track("install_prompt_native_triggered", { platform: "android" });
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      track("install_prompt_native_outcome", { platform: "android", outcome });
      if (outcome === "accepted") {
        setOpen(false);
        setShowFab(false);
      }
      setDeferredPrompt(null);
    }
  };

  const dismissFab = () => {
    track("install_prompt_dismissed", { platform });
    localStorage.setItem(STORAGE_KEY, "1");
    setShowFab(false);
  };

  if (isStandalone()) return null;

  return (
    <>
      {showFab && (
        <div className="fixed bottom-24 right-4 z-40 md:bottom-6 md:right-24 flex items-center gap-2">
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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-primary" />
              Install NAFT App
            </DialogTitle>
            <DialogDescription>
              Add NAFT to your home screen for instant access, faster loads, and a full-screen experience.
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue={platform} className="mt-2">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="ios">iPhone / iPad</TabsTrigger>
              <TabsTrigger value="android">Android</TabsTrigger>
            </TabsList>

            <TabsContent value="ios" className="space-y-3 mt-4">
              <p className="text-xs text-muted-foreground">
                Open this site in <strong>Safari</strong> (not Chrome) to install.
              </p>
              <ol className="space-y-3 text-sm">
                <li className="flex gap-3">
                  <span className="flex-none w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">1</span>
                  <span className="flex items-center gap-1.5 flex-wrap">
                    Tap the <Share className="w-4 h-4 inline text-primary" /> <strong>Share</strong> button at the bottom of Safari.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-none w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">2</span>
                  <span className="flex items-center gap-1.5 flex-wrap">
                    Scroll down and tap <Plus className="w-4 h-4 inline text-primary" /> <strong>Add to Home Screen</strong>.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-none w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">3</span>
                  <span>Tap <strong>Add</strong> in the top-right corner. The NAFT icon will appear on your home screen.</span>
                </li>
              </ol>
            </TabsContent>

            <TabsContent value="android" className="space-y-3 mt-4">
              <p className="text-xs text-muted-foreground">
                Open this site in <strong>Chrome</strong> for the best install experience.
              </p>
              {deferredPrompt && (
                <Button onClick={handleAndroidInstall} className="w-full" size="lg">
                  <Download className="w-4 h-4 mr-2" />
                  Install Now
                </Button>
              )}
              <ol className="space-y-3 text-sm">
                <li className="flex gap-3">
                  <span className="flex-none w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">1</span>
                  <span className="flex items-center gap-1.5 flex-wrap">
                    Tap the <MoreVertical className="w-4 h-4 inline text-primary" /> <strong>menu</strong> (three dots) in the top-right of Chrome.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-none w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">2</span>
                  <span>Tap <strong>Install app</strong> or <strong>Add to Home screen</strong>.</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-none w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">3</span>
                  <span>Confirm by tapping <strong>Install</strong>. NAFT will be added to your app drawer.</span>
                </li>
              </ol>
            </TabsContent>
          </Tabs>

          <p className="text-[11px] text-muted-foreground mt-4 text-center">
            Free • No app store required • Works offline-ready
          </p>
        </DialogContent>
      </Dialog>
    </>
  );
}
