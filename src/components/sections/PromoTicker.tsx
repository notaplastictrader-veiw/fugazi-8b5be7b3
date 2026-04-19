import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useSponsoredTickerItems } from "@/components/sponsored/SponsoredTickerItems";

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
  const sponsored = useSponsoredTickerItems("sitewide-banner");

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

  const sponsoredLabels = sponsored.map((s) => `⭐ ${s.label}`);
  const merged = [...sponsoredLabels, ...promoItems];
  const items = [...merged, ...merged, ...merged];
  return (
    <div className="relative z-[200] bg-secondary/80 backdrop-blur-sm border-b border-border overflow-hidden h-[34px] flex items-center">
      <div className="flex-shrink-0 px-3">
        <Link to="/promotions" className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-[0.15em] text-primary-foreground font-bold px-2.5 py-0.5 rounded bg-primary shadow-[0_0_8px_hsl(var(--primary)/0.3)] hover:brightness-110 transition-all">
          PROMOTIONS
          <span className="text-[8px]">▶</span>
        </Link>
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
