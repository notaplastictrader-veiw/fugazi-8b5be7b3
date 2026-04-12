import { useEffect, useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import SEO from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { Gift, ExternalLink, Clock, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface Promotion {
  id: string;
  title: string;
  description: string;
  promo_type: string;
  bonus_amount: string;
  expiry_date: string | null;
  link_url: string;
  image_url: string;
  is_featured: boolean;
  created_at: string;
}

const fallbackPromos: Promotion[] = [
  { id: "1", title: "Exness 100% Deposit Bonus", description: "Get 100% bonus on your first deposit. Trade with double the capital from day one.", promo_type: "bonus", bonus_amount: "100%", expiry_date: "2026-05-31", link_url: "#", image_url: "", is_featured: true, created_at: "" },
  { id: "2", title: "FTMO 20% Off Challenge Fee", description: "Save 20% on FTMO challenge fees. Limited time offer for all account sizes.", promo_type: "discount", bonus_amount: "20%", expiry_date: "2026-04-30", link_url: "#", image_url: "", is_featured: true, created_at: "" },
  { id: "3", title: "XM $30 No-Deposit Bonus", description: "Start trading with $30 free — no deposit required. Available for new accounts.", promo_type: "no-deposit", bonus_amount: "$30", expiry_date: null, link_url: "#", image_url: "", is_featured: false, created_at: "" },
  { id: "4", title: "IC Markets Raw Spread from 0.0", description: "Open a Raw Spread account and enjoy spreads from 0.0 pips on major pairs.", promo_type: "spread", bonus_amount: "0.0 pips", expiry_date: null, link_url: "#", image_url: "", is_featured: false, created_at: "" },
  { id: "5", title: "Maven Trading 90% Profit Split", description: "Keep 90% of your profits. One of the highest splits in the prop firm industry.", promo_type: "profit-split", bonus_amount: "90%", expiry_date: "2026-06-15", link_url: "#", image_url: "", is_featured: true, created_at: "" },
  { id: "6", title: "Bullwaves — Start with Just $10", description: "Micro-lot trading with a minimum $10 deposit. Perfect for beginners.", promo_type: "low-deposit", bonus_amount: "$10 min", expiry_date: null, link_url: "#", image_url: "", is_featured: false, created_at: "" },
];

const typeColors: Record<string, string> = {
  bonus: "bg-primary/20 text-primary",
  discount: "bg-accent/20 text-accent",
  "no-deposit": "bg-[hsl(var(--teal))]/20 text-[hsl(var(--teal))]",
  spread: "bg-[hsl(var(--purple))]/20 text-[hsl(var(--purple))]",
  "profit-split": "bg-[hsl(var(--coral))]/20 text-[hsl(var(--coral))]",
  "low-deposit": "bg-muted-foreground/20 text-muted-foreground",
};

const Promotions = () => {
  const [promos, setPromos] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("promotions")
        .select("*")
        .eq("status", "published")
        .order("is_featured", { ascending: false })
        .order("created_at", { ascending: false });
      setPromos(data && data.length > 0 ? data : fallbackPromos);
      setLoading(false);
    };
    load();
  }, []);

  const featured = promos.filter((p) => p.is_featured);
  const regular = promos.filter((p) => !p.is_featured);

  return (
    <MainLayout>
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-14">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-mono font-semibold bg-primary/10 text-primary mb-4">
            🎁 PROMOTIONS
          </span>
          <h1 className="text-4xl md:text-5xl font-display font-extrabold text-foreground mb-4">
            Exclusive Broker <span className="text-primary">Deals & Bonuses</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Verified promotions from trusted brokers. We only list offers from platforms that pass our review standards.
          </p>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-2xl" />
            ))}
          </div>
        ) : (
          <>
            {featured.length > 0 && (
              <div className="mb-10">
                <h2 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-5">
                  <Star className="w-5 h-5 text-accent" /> Featured Offers
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {featured.map((p) => (
                    <PromoCard key={p.id} promo={p} featured />
                  ))}
                </div>
              </div>
            )}

            {regular.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-5">All Promotions</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {regular.map((p) => (
                    <PromoCard key={p.id} promo={p} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </section>
    </MainLayout>
  );
};

const PromoCard = ({ promo, featured }: { promo: Promotion; featured?: boolean }) => {
  const isExpired = promo.expiry_date && new Date(promo.expiry_date) < new Date();

  return (
    <div className={`glass-card rounded-2xl p-6 flex flex-col gap-4 transition-all hover:border-primary/30 ${featured ? "border-accent/30 shadow-[0_0_20px_hsl(var(--accent)/0.08)]" : ""} ${isExpired ? "opacity-50" : ""}`}>
      <div className="flex items-center justify-between">
        <Badge className={`text-[10px] font-mono uppercase ${typeColors[promo.promo_type] || "bg-muted text-muted-foreground"}`}>
          {promo.promo_type.replace("-", " ")}
        </Badge>
        {featured && <Star className="w-4 h-4 text-accent fill-accent" />}
      </div>

      <div className="flex-1">
        <h3 className="text-lg font-bold text-foreground mb-2">{promo.title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{promo.description}</p>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-border">
        <div className="flex items-center gap-3">
          <span className="text-xl font-extrabold text-primary">{promo.bonus_amount}</span>
          {promo.expiry_date && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              {isExpired ? "Expired" : `Ends ${new Date(promo.expiry_date).toLocaleDateString()}`}
            </span>
          )}
        </div>
        <a href={promo.link_url || "#"} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
          Claim <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
};

export default Promotions;
