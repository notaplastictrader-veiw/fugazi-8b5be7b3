import { promoItems } from "@/data/brokers";

const PromoTicker = () => {
  return (
    <div className="fixed top-0 left-0 right-0 z-[60] promo-ticker-bg text-white text-xs font-semibold overflow-hidden h-8 flex items-center">
      <div className="ticker-track">
        {[...promoItems, ...promoItems].map((item, i) => (
          <span key={i} className="flex-shrink-0 px-4">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
};

export default PromoTicker;
