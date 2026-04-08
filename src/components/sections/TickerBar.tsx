import { tickerPairs } from "@/data/brokers";

const TickerBar = () => {
  return (
    <div className="relative z-40 bg-card/80 backdrop-blur-md border-y border-border overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 h-10 flex items-center justify-between gap-6">
        {tickerPairs.map((item, i) => (
          <div key={i} className="flex items-center gap-2 text-xs font-mono">
            <span className="text-muted-foreground">{item.pair}</span>
            <span className="text-foreground font-semibold">{item.price}</span>
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
