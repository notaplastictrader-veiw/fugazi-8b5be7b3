import { useState, useEffect } from "react";
import { Sparkles, MessageCircle, Plus, X } from "lucide-react";
import AIChatSheet from "@/components/ai/AIChatSheet";
import { cn } from "@/lib/utils";

/**
 * Consolidated FAB — replaces standalone AIChatButton + LiveChatButton.
 * Single primary FAB that expands radially to reveal AI assistant + Telegram.
 */
const FloatingActions = () => {
  const [open, setOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);

  // Close on Esc
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <div
        className="fixed right-5 z-[150] flex flex-col items-end gap-3"
        style={{ bottom: "calc(32px + env(safe-area-inset-bottom, 0px) + 80px)" }}
      >
        {/* AI action */}
        <button
          onClick={() => { setAiOpen(true); setOpen(false); }}
          aria-label="Open AI Assistant"
          className={cn(
            "w-12 h-12 rounded-full bg-card border border-primary/40 text-primary flex items-center justify-center shadow-[0_0_20px_hsl(var(--primary)/0.35)] transition-all duration-300",
            open ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-3 pointer-events-none"
          )}
        >
          <Sparkles className="w-5 h-5" />
        </button>

        {/* Telegram action */}
        <a
          href="https://t.me/notafugazitrader"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat on Telegram"
          className={cn(
            "w-12 h-12 rounded-full bg-[#229ED9] text-white flex items-center justify-center shadow-lg transition-all duration-300 delay-75",
            open ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-3 pointer-events-none"
          )}
          onClick={() => setOpen(false)}
        >
          <MessageCircle className="w-5 h-5" />
        </a>

        {/* Trigger */}
        <button
          onClick={() => setOpen(o => !o)}
          aria-label={open ? "Close actions" : "Open actions"}
          aria-expanded={open}
          className="w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-[0_4px_24px_hsl(var(--primary)/0.45)] hover:scale-105 transition-transform"
        >
          {open ? <X className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
        </button>
      </div>

      <AIChatSheet open={aiOpen} onOpenChange={setAiOpen} />
    </>
  );
};

export default FloatingActions;
