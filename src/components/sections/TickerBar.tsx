import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { tickerPairs as fallbackPairs } from "@/data/brokers";

interface TickerPair {
  pair: string;
  price: string;
  change: string;
  up: boolean;
}

const TickerBar = () => {
  const [pairs, setPairs] = useState<TickerPair[]>(fallbackPairs);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "ticker_pairs")
        .maybeSingle();
      if (data?.value) setPairs(data.value as unknown as TickerPair[]);
    };
    fetch();
  }, []);

  const items = [...pairs, ...pairs];
  return (
    <div className="relative z-[200] bg-card/90 backdrop-blur-sm border-b border-border overflow-hidden h-[32px] flex items-center">
      <div className="ticker-track">
        {items.map((item, i) => (
          <div key={i} className="flex-shrink-0 flex items-center gap-2 text-[11px] font-mono">
            <span className="text-muted-foreground font-bold">{item.pair}</span>
            <span className="text-foreground">{item.price}</span>
            <span className={item.up ? "text-primary" : "text-destructive"}>
              {item.change}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TickerBar;
