import { useLivePrices } from "@/hooks/useLivePrices";

const TickerBar = () => {
  const { pairs } = useLivePrices();
  const items = [...pairs, ...pairs];

  return (
    <div className="relative z-[200] bg-card/90 backdrop-blur-sm border-b border-border overflow-hidden h-[32px] flex items-center">
      {/* LIVE chip */}
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
            <div key={i} className="flex-shrink-0 flex items-center gap-2 text-[11px] font-mono">
              <span className="text-muted-foreground font-bold">{item.pair}</span>
              <span className="text-foreground">{item.price}</span>
              <span className={item.up ? "text-bull" : "text-bear"}>
                {item.change}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TickerBar;
