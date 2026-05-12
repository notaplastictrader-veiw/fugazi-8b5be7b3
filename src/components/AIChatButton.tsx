import { useState } from "react";
import { Sparkles } from "lucide-react";
import AIChatSheet from "@/components/ai/AIChatSheet";

const AIChatButton = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-[148px] right-5 z-[150] w-14 h-14 bg-card border border-primary/40 text-primary rounded-full flex items-center justify-center shadow-[0_0_20px_hsl(var(--primary)/0.35)] hover:scale-110 hover:shadow-[0_0_30px_hsl(var(--primary)/0.55)] transition-all group"
        title="Ask NAFT AI Assistant"
        aria-label="Open AI Assistant"
      >
        <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform" />
        <span className="absolute -top-1 -right-1 text-[8px] font-mono font-bold bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full">
          AI
        </span>
      </button>
      <AIChatSheet open={open} onOpenChange={setOpen} />
    </>
  );
};

export default AIChatButton;
