import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const fallbackItems = [
  "🔥 Exness 100% Deposit Bonus",
  "🚀 FTMO 20% Off Challenge",
  "💰 Bullwaves — Start with $10",
  "⚡ IC Markets Raw Spread 0.0",
  "🏆 Maven Trading 90% Profit Split",
  "🎁 XM $30 No-Deposit Bonus",
];

const PromoTicker = () => {
  const [promoItems, setPromoItems] = useState(fallbackItems);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "promo_ticker")
        .maybeSingle();
      if (data?.value && Array.isArray(data.value)) setPromoItems(data.value as string[]);
    };
    fetch();
  }, []);

  const items = [...promoItems, ...promoItems];
  return (
    <div className="relative z-[200] bg-secondary/80 backdrop-blur-sm border-b border-border overflow-hidden h-[34px] flex items-center">
      <div className="flex-shrink-0 px-3">
        <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-primary font-bold border border-primary/40 px-2.5 py-0.5 rounded bg-primary/10 shadow-[0_0_8px_hsl(var(--primary)/0.3)] animate-pulse">
          🔥 Promotions
        </span>
      </div>
      <div className="overflow-hidden flex-1">
        <div className="ticker-track-fast">
          {items.map((text, i) => (
            <a key={i} href="#" className="flex-shrink-0 flex items-center gap-2 text-xs hover:text-primary transition-colors cursor-pointer">
              <span className="text-muted-foreground">{text}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PromoTicker;
