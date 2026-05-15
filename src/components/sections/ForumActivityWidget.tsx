import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { MessageSquare, Pin, ArrowRight } from "lucide-react";

interface Thread {
  id: string;
  slug: string;
  title: string;
  category: string;
  reply_count: number;
  last_reply_at: string;
  pinned: boolean;
}

const FALLBACK: Thread[] = [
  { id: "1", slug: "withdrawal-issue-broker-x", title: "Anyone facing withdrawal delays with Broker X?", category: "Brokers", reply_count: 14, last_reply_at: new Date(Date.now() - 3600000).toISOString(), pinned: true },
  { id: "2", slug: "best-prop-firm-2026", title: "Best prop firm in 2026 — your picks?", category: "Prop Firms", reply_count: 28, last_reply_at: new Date(Date.now() - 7200000).toISOString(), pinned: false },
  { id: "3", slug: "scalping-eurusd-strategy", title: "Scalping EURUSD — share your setup", category: "Strategies", reply_count: 9, last_reply_at: new Date(Date.now() - 14400000).toISOString(), pinned: false },
  { id: "4", slug: "ic-markets-vs-pepperstone", title: "IC Markets vs Pepperstone — real spreads", category: "Brokers", reply_count: 21, last_reply_at: new Date(Date.now() - 28800000).toISOString(), pinned: false },
  { id: "5", slug: "new-trader-mt5-setup", title: "New trader — MT5 setup checklist?", category: "Beginners", reply_count: 6, last_reply_at: new Date(Date.now() - 43200000).toISOString(), pinned: false },
];

const timeAgo = (iso: string) => {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
};

const ForumActivityWidget = () => {
  const [threads, setThreads] = useState<Thread[]>([]);

  useEffect(() => {
    supabase
      .from("forum_threads")
      .select("id,slug,title,category,reply_count,last_reply_at,pinned")
      .order("pinned", { ascending: false })
      .order("last_reply_at", { ascending: false })
      .limit(5)
      .then(({ data }) => setThreads((data as Thread[]) || []));
  }, []);

  const data = threads.length ? threads : FALLBACK;

  return (
    <section className="container mx-auto px-4 py-16">
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="px-6 py-5 border-b border-border flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <MessageSquare className="w-3 h-3 text-primary" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-primary">Verified Trader Forum</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-display font-extrabold leading-tight">Latest community threads</h2>
          </div>
          <Link to="/forum" className="text-xs font-mono uppercase tracking-widest text-primary hover:underline flex items-center gap-1">
            All threads <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="divide-y divide-border">
          {data.map(t => (
            <Link
              key={t.id}
              to={`/forum/${t.slug}`}
              className="flex items-center gap-4 px-6 py-4 hover:bg-secondary/40 transition-colors group"
            >
              {t.pinned && <Pin className="w-3.5 h-3.5 text-accent shrink-0" />}
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm text-foreground truncate group-hover:text-primary transition-colors">
                  {t.title}
                </div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mt-0.5">
                  {t.category} · {timeAgo(t.last_reply_at)} ago
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-sm font-mono font-bold text-foreground">{t.reply_count}</div>
                <div className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground">replies</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ForumActivityWidget;
