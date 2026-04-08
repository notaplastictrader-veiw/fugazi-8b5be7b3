const promoItems = [
  { badge: "HOT", text: "Exness — 20% Deposit Bonus · This week only" },
  { badge: "NEW", text: "FTMO — 10% off Challenge fee with code NAPT10" },
  { badge: "LIMITED", text: "IC Markets — Zero commission first 30 days" },
  { badge: "HOT", text: "Pepperstone — Cashback up to $5/lot on Raw accounts" },
  { badge: "NEW", text: "XM Global — $30 No Deposit Bonus for new accounts" },
];

const badgeColor: Record<string, string> = {
  HOT: "bg-destructive text-destructive-foreground",
  NEW: "bg-primary text-primary-foreground",
  LIMITED: "bg-accent text-accent-foreground",
};

const PromoTicker = () => {
  const items = [...promoItems, ...promoItems];
  return (
    <div className="relative z-[200] bg-secondary/80 backdrop-blur-sm border-b border-border overflow-hidden h-[34px] flex items-center">
      <div className="flex-shrink-0 px-3">
        <span className="text-[9px] font-mono uppercase tracking-[0.15em] text-primary border border-primary/30 px-2 py-0.5 rounded">
          Promotions
        </span>
      </div>
      <div className="overflow-hidden flex-1">
        <div className="ticker-track-fast">
          {items.map((item, i) => (
            <a key={i} href="#" className="flex-shrink-0 flex items-center gap-2 text-xs hover:text-primary transition-colors cursor-pointer">
              <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${badgeColor[item.badge]}`}>
                {item.badge}
              </span>
              <span className="text-muted-foreground">{item.text}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PromoTicker;
