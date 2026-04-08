import { tickerPairs } from "@/data/brokers";

const TickerBar = () => {
  const items = [...tickerPairs, ...tickerPairs];

  return (
    <div className="sticky top-[6rem] z-40 bg-card/90 backdrop-blur-md border-y border-border overflow-hidden h-10 flex items-center">
      <div className="ticker-track">
        {items.map((item, i) => (
          <span key={i} className="flex-shrink-0 flex items-center gap-2 text-xs font-mono">
            <span className="text-muted-foreground">{item.pair}</span>
            <span className="text-foreground font-semibold">{item.price}</span>
            <span className={item.up ? "text-primary" : "text-destructive"}>
              {item.change}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
};

export default TickerBar;
