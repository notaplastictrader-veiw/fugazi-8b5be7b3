import { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, ShieldCheck } from "lucide-react";

const STORAGE_KEY = "naft_exit_intent_shown_v1";
const SUPPRESS_PATHS = ["/login", "/signup", "/auth", "/dashboard", "/admin", "/match"];

const ExitIntentModal = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia?.("(max-width: 768px)").matches) return;
    if (SUPPRESS_PATHS.some((p) => location.pathname.startsWith(p))) return;
    if (sessionStorage.getItem(STORAGE_KEY)) return;

    let armed = false;
    const armTimer = setTimeout(() => { armed = true; }, 8000); // wait 8s before arming

    const onLeave = (e: MouseEvent) => {
      if (!armed) return;
      if (e.clientY > 0) return;
      if (sessionStorage.getItem(STORAGE_KEY)) return;
      sessionStorage.setItem(STORAGE_KEY, "1");
      setOpen(true);
    };
    document.addEventListener("mouseleave", onLeave);
    return () => {
      clearTimeout(armTimer);
      document.removeEventListener("mouseleave", onLeave);
    };
  }, [location.pathname]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-3">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <DialogTitle className="text-2xl font-display font-extrabold leading-tight">
            Wait — find your perfect broker in 60 seconds.
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground pt-2">
            Answer 6 quick questions and we'll match you with the safest, lowest-cost broker for your style. 100% free, no signup required.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2 mt-2">
          <Link to="/match" onClick={() => setOpen(false)}>
            <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold">
              Start Free Broker Match →
            </Button>
          </Link>
          <button
            onClick={() => setOpen(false)}
            className="text-xs text-muted-foreground hover:text-foreground mt-1"
          >
            No thanks, I'll keep browsing
          </button>
          <p className="text-[10px] text-muted-foreground text-center font-mono mt-2 inline-flex items-center justify-center gap-1">
            <ShieldCheck className="w-3 h-3" /> Trusted by 47,000+ verified traders
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExitIntentModal;
