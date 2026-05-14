import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2, AlertTriangle, MessageSquare, Banknote } from "lucide-react";

type Activity = {
  id: string;
  kind: "review" | "complaint" | "scam" | "proof";
  label: string;
  href: string;
  at: string;
};

const iconFor = (k: Activity["kind"]) => {
  switch (k) {
    case "review": return <MessageSquare className="w-3.5 h-3.5 text-primary" />;
    case "complaint": return <AlertTriangle className="w-3.5 h-3.5 text-orange-500" />;
    case "scam": return <AlertTriangle className="w-3.5 h-3.5 text-destructive" />;
    case "proof": return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />;
  }
};

const timeAgo = (iso: string) => {
  const m = Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 60000));
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

const LiveTrustTicker = () => {
  const [items, setItems] = useState<Activity[]>([]);

  const load = async () => {
    const [reviews, complaints, scams, proofs] = await Promise.all([
      supabase.from("reviews").select("id, created_at, broker_id, brokers(name, slug)").eq("status", "published").order("created_at", { ascending: false }).limit(4),
      supabase.from("complaints").select("id, created_at, broker_id, brokers(name, slug)").eq("status", "published").order("created_at", { ascending: false }).limit(4),
      supabase.from("scam_alerts").select("id, created_at, broker_id, title, brokers(name, slug)").eq("status", "published").order("created_at", { ascending: false }).limit(4),
      supabase.from("withdrawal_proofs").select("id, created_at, amount, currency, brokers(name, slug)").eq("status", "verified").order("verified_at", { ascending: false }).limit(4),
    ]);

    const merged: Activity[] = [];
    reviews.data?.forEach((r: any) => r.brokers && merged.push({
      id: `r-${r.id}`, kind: "review", at: r.created_at,
      label: `New review · ${r.brokers.name}`,
      href: `/brokers/${r.brokers.slug}`,
    }));
    complaints.data?.forEach((c: any) => c.brokers && merged.push({
      id: `c-${c.id}`, kind: "complaint", at: c.created_at,
      label: `Complaint filed · ${c.brokers.name}`,
      href: `/brokers/${c.brokers.slug}`,
    }));
    scams.data?.forEach((s: any) => merged.push({
      id: `s-${s.id}`, kind: "scam", at: s.created_at,
      label: `Scam alert · ${s.brokers?.name || "Unknown"}`,
      href: `/scam-alerts/${s.id}`,
    }));
    proofs.data?.forEach((p: any) => p.brokers && merged.push({
      id: `p-${p.id}`, kind: "proof", at: p.created_at,
      label: `Verified payout · ${p.brokers.name}${p.amount ? ` (${p.currency || "$"}${Number(p.amount).toLocaleString()})` : ""}`,
      href: `/brokers/${p.brokers.slug}#proofs`,
    }));

    merged.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
    setItems(merged.slice(0, 12));
  };

  useEffect(() => {
    load();
    const channel = supabase
      .channel("live-trust-ticker")
      .on("postgres_changes", { event: "*", schema: "public", table: "reviews" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "complaints" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "scam_alerts" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "withdrawal_proofs" }, load)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  if (items.length === 0) return null;

  return (
    <section className="py-6 border-y border-border/50 bg-secondary/20">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-3 mb-3">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
          </span>
          <span className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
            Live Trust Activity · Real platform events
          </span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {items.map((it) => (
            <Link
              key={it.id}
              to={it.href}
              className="flex-shrink-0 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border/60 bg-card hover:border-primary/40 hover:bg-primary/5 transition-colors text-xs"
            >
              {iconFor(it.kind)}
              <span className="text-foreground/90 truncate max-w-[280px]">{it.label}</span>
              <span className="text-muted-foreground font-mono text-[10px]">{timeAgo(it.at)}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LiveTrustTicker;
