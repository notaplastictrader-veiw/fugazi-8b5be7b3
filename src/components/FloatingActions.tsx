import { useState, useEffect } from "react";
import { Sparkles, MessageCircle, Plus, X, Send, Headphones } from "lucide-react";
import AIChatSheet from "@/components/ai/AIChatSheet";
import LiveChatSheet from "@/components/support/LiveChatSheet";
import { cn } from "@/lib/utils";

/**
 * Floating help FAB — expands to 4 support options:
 * Quick Assist (AI), Live Chat (in-app support), Telegram, WhatsApp (coming soon).
 */
const FloatingActions = () => {
  const [open, setOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [liveOpen, setLiveOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const itemBase =
    "flex items-center gap-2 transition-all duration-300";
  const pillLabel =
    "px-3 py-1.5 rounded-full bg-card border border-border text-xs font-medium text-foreground shadow-md whitespace-nowrap";
  const iconBtn =
    "w-11 h-11 rounded-full flex items-center justify-center shadow-lg shrink-0";

  return (
    <>
      <div
        className="fixed right-5 z-[150] flex flex-col items-end gap-3"
        style={{ bottom: "calc(32px + env(safe-area-inset-bottom, 0px) + 80px)" }}
      >
        {/* AI Quick Assist */}
        <div
          className={cn(
            itemBase,
            open ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-3 pointer-events-none"
          )}
          style={{ transitionDelay: open ? "0ms" : "0ms" }}
        >
          <span className={pillLabel}>Quick Assist</span>
          <button
            onClick={() => { setAiOpen(true); setOpen(false); }}
            aria-label="Open AI Quick Assist"
            className={cn(iconBtn, "bg-card border border-primary/40 text-primary shadow-[0_0_20px_hsl(var(--primary)/0.35)]")}
          >
            <Sparkles className="w-5 h-5" />
          </button>
        </div>

        {/* Live Chat */}
        <div
          className={cn(
            itemBase,
            open ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-3 pointer-events-none"
          )}
          style={{ transitionDelay: open ? "60ms" : "0ms" }}
        >
          <span className={pillLabel}>Live Chat · ~15–30 min reply</span>
          <button
            onClick={() => { setLiveOpen(true); setOpen(false); }}
            aria-label="Open live chat with support"
            className={cn(iconBtn, "bg-primary text-primary-foreground")}
          >
            <Headphones className="w-5 h-5" />
          </button>
        </div>

        {/* Telegram */}
        <div
          className={cn(
            itemBase,
            open ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-3 pointer-events-none"
          )}
          style={{ transitionDelay: open ? "120ms" : "0ms" }}
        >
          <span className={pillLabel}>Telegram</span>
          <a
            href="https://t.me/notafugazitrader"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat on Telegram"
            onClick={() => setOpen(false)}
            className={cn(iconBtn, "bg-[#229ED9] text-white")}
          >
            <Send className="w-5 h-5" />
          </a>
        </div>

        {/* WhatsApp — coming soon */}
        <div
          className={cn(
            itemBase,
            open ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-3 pointer-events-none"
          )}
          style={{ transitionDelay: open ? "180ms" : "0ms" }}
        >
          <span className={pillLabel}>WhatsApp — Coming soon</span>
          <button
            disabled
            aria-label="WhatsApp coming soon"
            className={cn(iconBtn, "bg-[#25D366]/60 text-white cursor-not-allowed opacity-70")}
          >
            <MessageCircle className="w-5 h-5" />
          </button>
        </div>

        {/* Trigger */}
        <button
          onClick={() => setOpen(o => !o)}
          aria-label={open ? "Close help menu" : "Open help menu"}
          aria-expanded={open}
          className="flex items-center gap-1.5 h-14 pl-4 pr-5 rounded-full bg-primary text-primary-foreground shadow-[0_4px_24px_hsl(var(--primary)/0.45)] hover:scale-105 transition-transform font-semibold"
        >
          {open ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          <span className="text-sm">{open ? "Close" : "Help"}</span>
        </button>
      </div>

      <AIChatSheet open={aiOpen} onOpenChange={setAiOpen} />
      <LiveChatSheet open={liveOpen} onOpenChange={setLiveOpen} />
    </>
  );
};

export default FloatingActions;
