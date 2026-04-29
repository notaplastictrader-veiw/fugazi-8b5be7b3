import { useLivePrices } from "@/hooks/useLivePrices";

const BottomTicker = () => {
  const { pairs } = useLivePrices();
  const items = [...pairs, ...pairs];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-card/90 backdrop-blur-md border-t border-border overflow-hidden h-8 flex items-center">
      <div className="flex-shrink-0 flex items-center gap-1.5 px-3 h-full border-r border-border bg-background/60">
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-75 animate-ping" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
        </span>
        <span className="text-[10px] font-mono font-bold tracking-wider text-primary">LIVE</span>
      </div>
      <div className="flex-1 min-w-0 overflow-hidden">
        <div className="ticker-track">
          {items.map((item, i) => (
            <span key={i} className="flex-shrink-0 flex items-center gap-2 text-[10px] font-mono">
              <span className="text-muted-foreground">{item.pair}</span>
              <span className="text-foreground">{item.price}</span>
              <span className={item.up ? "text-bull" : "text-bear"}>
                {item.change}
              </span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BottomTicker;
