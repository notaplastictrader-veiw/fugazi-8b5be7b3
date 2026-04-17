import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import SEO from "@/components/SEO";
import { Gift, ExternalLink, Clock, Star, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { fallbackPromos, promoTypes, PromotionDetail } from "@/data/promotionsData";
import { supabase } from "@/integrations/supabase/client";

const typeColors: Record<string, string> = {
  bonus: "bg-primary/20 text-primary",
  discount: "bg-accent/20 text-accent",
  "no-deposit": "bg-[hsl(var(--teal))]/20 text-[hsl(var(--teal))]",
  spread: "bg-[hsl(var(--purple))]/20 text-[hsl(var(--purple))]",
  "profit-split": "bg-[hsl(var(--coral))]/20 text-[hsl(var(--coral))]",
  "low-deposit": "bg-muted-foreground/20 text-muted-foreground",
};

const Promotions = () => {
  const [activeFilter, setActiveFilter] = useState("all");
  const promos = fallbackPromos;

  const filtered = activeFilter === "all" ? promos : promos.filter((p) => p.promo_type === activeFilter);
  const featured = filtered.filter((p) => p.is_featured);
  const regular = filtered.filter((p) => !p.is_featured);

  return (
    <MainLayout>
      <SEO
        title="Broker Promotions & Bonuses"
        description="Latest forex broker promotions, deposit bonuses, cashback offers, and trading contests. Curated and verified deals."
        path="/promotions"
      />
      <section className="max-w-6xl mx-auto px-4 pt-6 pb-20">
        <div className="text-center mb-10">
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

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 justify-center mb-10">
          {promoTypes.map((t) => (
            <button
              key={t.value}
              onClick={() => setActiveFilter(t.value)}
              className={`px-4 py-1.5 rounded-full text-xs font-mono font-semibold transition-all border ${
                activeFilter === t.value
                  ? "bg-primary text-primary-foreground border-primary shadow-[0_0_12px_hsl(var(--primary)/0.3)]"
                  : "bg-card border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">No promotions found for this category.</div>
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

const PromoCard = ({ promo, featured }: { promo: PromotionDetail; featured?: boolean }) => {
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
        <h3 className="text-lg font-bold text-foreground mb-1">{promo.title}</h3>
        <p className="text-xs text-muted-foreground/60 mb-2">by {promo.broker_name}</p>
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{promo.description}</p>
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
      </div>

      <div className="flex gap-2">
        <Link to={`/promotions/${promo.slug}`} className="flex-1">
          <button className="w-full text-xs font-semibold py-2 rounded-lg border border-border text-foreground hover:border-primary/40 hover:text-primary transition-all flex items-center justify-center gap-1">
            Read More <ArrowRight className="w-3 h-3" />
          </button>
        </Link>
        <a href={promo.link_url || "#"} target="_blank" rel="noopener noreferrer" className="flex-1">
          <button className="w-full text-xs font-semibold py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all flex items-center justify-center gap-1" disabled={!!isExpired}>
            Claim Offer <ExternalLink className="w-3 h-3" />
          </button>
        </a>
      </div>
    </div>
  );
};

export default Promotions;
