import { tickerPairs } from "@/data/brokers";

const BottomTicker = () => {
  const items = [...tickerPairs, ...tickerPairs];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-card/90 backdrop-blur-md border-t border-border overflow-hidden h-8 flex items-center">
      <div className="ticker-track">
        {items.map((item, i) => (
          <span key={i} className="flex-shrink-0 flex items-center gap-2 text-[10px] font-mono">
            <span className="text-muted-foreground">{item.pair}</span>
            <span className="text-foreground">{item.price}</span>
            <span className={item.up ? "text-primary" : "text-destructive"}>
              {item.change}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
};

export default BottomTicker;
