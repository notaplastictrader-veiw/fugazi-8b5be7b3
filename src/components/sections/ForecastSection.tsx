import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { TrendingUp, TrendingDown, Clock } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";

interface Forecast {
  id: string;
  pair: string;
  direction: string;
  potential: string;
  reasoning: string;
  updated_label: string;
  category: string;
}

const defaultTabs = [
  { key: "forex", label: "Forex" },
  { key: "gold", label: "Metal (GOLD)" },
  { key: "crypto", label: "Crypto" },
];

const ForecastSection = () => {
  const cms = useSiteSettings<Record<string, any>>("forecast_section", {});
  const sectionTitle = cms.section_title || "Market";
  const tabs = defaultTabs;
  const [activeTab, setActiveTab] = useState("forex");
  const [forecasts, setForecasts] = useState<Forecast[]>([]);

  const fallbackForecasts: Forecast[] = [
    { id: "f1", pair: "XAU/USD", direction: "bullish", potential: "HIGH", reasoning: "Gold breaking above key resistance at $2,340. Fed rate cut expectations fueling momentum. Target $2,400.", updated_label: "2 hours ago", category: "forex" },
    { id: "f2", pair: "EUR/USD", direction: "bearish", potential: "MED", reasoning: "ECB dovish stance vs. USD strength. Expecting pullback to 1.0780 support zone.", updated_label: "4 hours ago", category: "forex" },
    { id: "f3", pair: "GBP/USD", direction: "bullish", potential: "HIGH", reasoning: "Strong UK employment data. Cable targeting 1.2750 resistance with bullish momentum.", updated_label: "6 hours ago", category: "forex" },
    { id: "f4", pair: "Gold Spot", direction: "bullish", potential: "HIGH", reasoning: "Central bank buying continues. Geopolitical tensions supporting safe-haven demand.", updated_label: "1 hour ago", category: "gold" },
    { id: "f5", pair: "BTC/USD", direction: "bullish", potential: "HIGH", reasoning: "Post-halving accumulation phase. Institutional inflows via ETFs at record levels. Target $75K.", updated_label: "3 hours ago", category: "crypto" },
  ];

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("forecasts").select("*").eq("status", "published").order("created_at", { ascending: false });
      if (data && data.length > 0) setForecasts(data as Forecast[]);
      else setForecasts(fallbackForecasts);
    };
    fetch();
  }, []);

  const filtered = forecasts.filter((f) => f.category === activeTab).slice(0, 3);

  return (
    <section className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <span className="section-tag">// FORECAST ENGINE</span>
        <h2 className="text-3xl md:text-4xl font-display font-extrabold text-foreground mt-3 mb-2">
          {sectionTitle} <span className="text-accent">Forecasts</span>
        </h2>
        <p className="text-sm text-muted-foreground mb-8">Daily analysis. No paid promotions. No broker bias.</p>

        <div className="flex flex-wrap gap-2 mb-8">
          {tabs.map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-1.5 text-xs font-mono rounded-full border transition-colors ${
                activeTab === tab.key ? "bg-accent text-accent-foreground border-accent" : "text-muted-foreground border-border hover:border-accent/40"
              }`}>{tab.label}</button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {filtered.map((f) => {
            const isBull = f.direction === "bullish";
            return (
              <div key={f.id} className="glass-card rounded-xl p-5 hover:border-accent/20 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold text-foreground font-mono">{f.pair}</h3>
                  <span className={`flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                    isBull ? "text-primary bg-primary/10 border-primary/20" : "text-destructive bg-destructive/10 border-destructive/20"
                  }`}>
                    {isBull ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {f.direction.toUpperCase()}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{f.reasoning}</p>
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                    f.potential === "HIGH" ? "text-primary bg-primary/10" : "text-accent bg-accent/10"
                  }`}>{f.potential} potential</span>
                  <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Clock className="w-3 h-3" /> {f.updated_label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ForecastSection;
