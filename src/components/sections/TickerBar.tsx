import { tickerPairs } from "@/data/brokers";

const TickerBar = () => {
  const items = [...tickerPairs, ...tickerPairs];
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
