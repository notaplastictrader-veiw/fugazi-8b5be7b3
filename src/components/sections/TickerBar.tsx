import { useLivePrices } from "@/hooks/useLivePrices";
import { msUntilForexOpen, formatDuration } from "@/lib/marketHours";

const TickerBar = () => {
  const { pairs, rateLimited, forexOpen } = useLivePrices();
  const showFallback = (rateLimited || pairs.length === 0) && pairs.length === 0;
  const items = showFallback ? [] : [...pairs, ...pairs];

  // Chip stays LIVE whenever data is flowing — per-pair "CLOSED" badges
  // already convey forex weekend status.
  const status: "LIVE" | "WAIT" = showFallback ? "WAIT" : "LIVE";
  const dotClass = status === "LIVE" ? "bg-primary" : "bg-accent";
  const textClass = status === "LIVE" ? "text-primary" : "text-accent";
  const label = status;
  const tooltip =
    status === "WAIT"
      ? "Live data temporarily unavailable. Auto-retry every 90s."
      : forexOpen
        ? "Live market data"
        : `Forex closed — crypto live. Reopens in ${formatDuration(msUntilForexOpen())} (Sun 22:00 UTC).`;

  return (
    <div className="relative z-[200] bg-card/90 backdrop-blur-sm border-b border-border overflow-hidden h-[32px] flex items-center">
      {/* Status chip */}
      <div
        className="flex-shrink-0 flex items-center gap-1.5 px-3 h-full border-r border-border bg-background/60"
        title={tooltip}
      >
        <span className="relative flex h-1.5 w-1.5">
          <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping ${dotClass}`} />
          <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${dotClass}`} />
        </span>
        <span className={`text-[10px] font-mono font-bold tracking-wider ${textClass}`}>
          {label}
        </span>
      </div>
      <div className="flex-1 min-w-0 overflow-hidden">
        {showFallback ? (
          <div className="flex items-center justify-center h-full">
            <span className="text-[11px] font-mono text-muted-foreground animate-pulse">
              ⏳ Updating soon — live prices resuming shortly…
            </span>
          </div>
        ) : (
          <div className="ticker-track">
            {items.map((item, i) => {
              const isClosed = item.closed === true;
              return (
                <div
                  key={i}
                  className={`flex-shrink-0 flex items-center gap-2 text-[11px] font-mono ${
                    isClosed ? "opacity-50" : ""
                  }`}
                >
                  <span className="text-muted-foreground font-bold">{item.pair}</span>
                  <span className="text-foreground">{item.price}</span>
                  {isClosed ? (
                    <span className="text-[9px] uppercase tracking-wider text-amber-500/80 border border-amber-500/40 px-1 rounded">
                      Closed
                    </span>
                  ) : (
                    <span className={item.up ? "text-bull" : "text-bear"}>{item.change}</span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TickerBar;
