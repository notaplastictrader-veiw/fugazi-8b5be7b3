import { useState } from "react";
import { forecasts } from "@/data/forecasts";
import { TrendingUp, TrendingDown, Clock } from "lucide-react";

const tabs = ["forex", "gold", "crypto", "sports"] as const;

const ForecastSection = () => {
  const [activeTab, setActiveTab] = useState<string>("forex");

  const filtered = forecasts.filter((f) => f.category === activeTab);

  return (
    <section className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <span className="section-tag">// FORECAST ENGINE</span>
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-3 mb-8">
          Market <span className="text-accent">Forecasts</span>
        </h2>

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 text-xs font-mono rounded-full border capitalize transition-colors ${
                activeTab === tab
                  ? "bg-accent text-accent-foreground border-accent"
                  : "text-muted-foreground border-border hover:border-accent/40"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Cards */}
        {activeTab === "sports" ? (
          <div className="glass-card rounded-xl p-12 text-center">
            <p className="text-muted-foreground font-mono">🏏 Sports forecasts coming soon...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {filtered.map((f, i) => {
              const isBull = f.direction === "bullish";
              return (
                <div key={i} className="glass-card rounded-xl p-5 hover:border-accent/20 transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-bold text-foreground font-mono">{f.pair}</h3>
                    <span className={`flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                      isBull
                        ? "text-primary bg-primary/10 border-primary/20"
                        : "text-destructive bg-destructive/10 border-destructive/20"
                    }`}>
                      {isBull ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {f.direction.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{f.reasoning}</p>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                      f.potential === "HIGH" ? "text-primary bg-primary/10" : "text-accent bg-accent/10"
                    }`}>
                      {f.potential} potential
                    </span>
                    <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {f.updated}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default ForecastSection;
