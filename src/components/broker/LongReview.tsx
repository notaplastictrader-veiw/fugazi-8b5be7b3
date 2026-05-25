import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AffiliateDisclosure from "@/components/common/AffiliateDisclosure";
import GeoAvailability from "@/components/broker/GeoAvailability";
import { Star, ShieldCheck, ExternalLink, CheckCircle2, XCircle, Clock, BookOpen, UserCheck, Share2, MessageCircle, Send, GitCompare, Flame, TrendingDown, Target, Wallet, AlertOctagon } from "lucide-react";

export interface LongReviewTable {
  headers: string[];
  rows: (string | number)[][];
  footnote?: string;
}
export interface LongReviewStep {
  number: number;
  title: string;
  detail: string;
  cta_inline?: { label: string; url: string };
}
export interface LongReviewSection {
  id: string;
  heading: string;
  body?: string;
  table?: LongReviewTable;
  bullets?: string[];
  for?: string[];
  not_for?: string[];
  steps?: LongReviewStep[];
  practical_note?: string;
  cta_after?: boolean;
}
export interface LongReviewFaq { q: string; a: string; }
export interface LongReviewAuthor {
  name?: string;
  role?: string;
  bio?: string;
  experience_years?: number;
  avatar_url?: string;
  sameAs?: string[];
}
export interface LongReviewComparisonBroker { slug?: string; name?: string; score?: number; verdict?: string; }
export interface LongReviewImageAsset { url?: string; alt?: string; caption?: string; section_id?: string; }
export interface LongReviewData {
  seo?: { title?: string; description?: string; og_image_alt?: string; focus_keyword?: string; secondary_keywords?: string[] };
  verdict?: {
    summary?: string;
    tldr?: string;
    best_for?: string;
    not_ideal_for?: string;
    trust_score?: number;
    star_rating?: number;
    bottom_line?: string;
    trust_breakdown?: { label: string; score: number; max: number; weight?: number }[];
  };
  at_a_glance?: Record<string, any>;
  geo?: { accepted?: string[]; excluded?: string[] };
  sections?: LongReviewSection[];
  faq?: LongReviewFaq[];
  affiliate_cta?: {
    label?: string;
    url?: string;
    promo_code?: string | null;
    friction_reducers?: string[];
  };
  trustpilot?: { rating?: number; reviews?: number; source_note?: string };
  internal_links?: { anchor: string; url: string }[];
  reading_time_minutes?: number;
  word_count?: number;
  schema_jsonld?: { review?: any; faqPage?: any; aggregateRating?: any; breadcrumbList?: any; organization?: any };
  factuality_legend?: boolean; // legacy, ignored
  // v4.7 additions
  author?: LongReviewAuthor;
  toc?: { id: string; label: string }[];
  social_snippet?: { x?: string; whatsapp?: string; telegram?: string };
  comparison_block?: { headline?: string; brokers?: LongReviewComparisonBroker[] };
  regulatory_risk_warning?: string;
  conflict_note?: string;
  last_human_review_at?: string;
  image_assets?: LongReviewImageAsset[];
  all_in_cost?: { eurusd_spread_usd?: number; commission_usd?: number; total_per_lot_usd?: number };
  target_locale?: string;
  hot_take?: string;
  // v4.9 prop-firm additions
  schema_version?: string;
  drawdown_explainer?: {
    daily_dd_base?: string;
    daily_dd_reset_time?: string;
    daily_dd_includes_open_trades?: boolean;
    max_dd_type?: string;
    trailing_locks_at_breakeven?: boolean;
    worked_example?: string;
    common_killer_scenario?: string;
  };
  pass_rate_data?: {
    claimed_by_firm?: string;
    claimed_source?: string;
    industry_benchmark?: string;
    naft_estimate?: string;
    note?: string;
  };
  red_flag_scan?: {
    sudden_rule_changes_90d?: boolean;
    recent_broker_switch_6m?: boolean;
    trustpilot_velocity_anomaly?: boolean;
    discord_mass_complaints_90d?: boolean;
    founder_anonymous?: boolean;
    registration_mismatch?: boolean;
    website_age_vs_founded_mismatch?: boolean;
    flags_found?: number;
    notes?: string;
  };
  payout_verification?: {
    verified_payouts_seen?: number;
    largest_single_payout_seen?: string;
    verification_method?: string;
    payout_denial_reports_90d?: number;
    denial_context?: string;
    average_processing_days?: string;
    payout_consistency_note?: string;
  };
}

interface Props { brokerName: string; brokerSlug: string; data: LongReviewData; onScrollToReviews?: () => void; }

// Strip leftover factuality dots from old content
const stripDots = (s: string | null | undefined) => (s ?? "").toString().replace(/[🟢🔵🟡🔴⚪]\s?/g, "");

// Map [INTERNAL: /path] and legacy [INTERNAL LINK: label] tokens
function renderBody(text: string, slug: string) {
  const clean = stripDots(text);
  const paragraphs = clean.split(/\n{2,}|\n(?=\d+\.\s)/).map(p => p.trim()).filter(Boolean);
  return paragraphs.map((p, i) => {
    const parts: (string | JSX.Element)[] = [];
    const re = /\[INTERNAL:\s*([^\]]+)\]|\[INTERNAL LINK:\s*([^\]]+)\]|\[AFFILIATE[^\]]*\]/gi;
    let last = 0; let m: RegExpExecArray | null; let key = 0;
    while ((m = re.exec(p)) !== null) {
      if (m.index > last) parts.push(p.slice(last, m.index));
      if (m[0].toUpperCase().includes("AFFILIATE")) {
        parts.push(<span key={`a-${i}-${key++}`} className="inline-block text-xs font-mono text-muted-foreground">[link below]</span>);
      } else {
        const raw = (m[1] || m[2] || "").trim();
        const to = raw.startsWith("/") ? raw : "#";
        const label = raw.startsWith("/") ? raw.replace(/^\/+/, "").replace(/-/g, " ") : raw;
        parts.push(
          <Link key={`l-${i}-${key++}`} to={to} className="text-primary underline underline-offset-2 hover:text-primary/80">
            {label}
          </Link>
        );
      }
      last = m.index + m[0].length;
    }
    if (last < p.length) parts.push(p.slice(last));
    return (
      <p key={i} className="text-foreground/85 leading-relaxed mb-4 whitespace-pre-line">
        {parts}
      </p>
    );
  });
}

const AtAGlance = ({ data }: { data: Record<string, any> }) => {
  const labelMap: Record<string, string> = {
    regulation: "Regulation",
    min_deposit: "Min deposit",
    max_leverage: "Max leverage",
    avg_spread_eurusd: "Avg EUR/USD spread",
    withdrawal_speed: "Withdrawal speed",
    platforms: "Platforms",
    islamic_account: "Islamic account",
    deposit_methods: "Deposit methods",
    // v4.9 prop-firm keys
    model: "Model",
    profit_target: "Profit target",
    max_daily_drawdown: "Max daily DD",
    daily_dd_calculation: "Daily DD calc",
    max_overall_drawdown: "Max overall DD",
    max_dd_type: "Max DD type",
    min_trading_days: "Min trading days",
    time_limit: "Time limit",
    profit_split: "Profit split",
    payout_frequency: "Payout frequency",
    first_payout_eligibility: "First payout eligibility",
    consistency_rule: "Consistency rule",
    news_trading: "News trading",
    weekend_holding: "Weekend holding",
    ea_allowed: "EAs allowed",
    copy_trading: "Copy trading",
    hedging: "Hedging",
    martingale: "Martingale",
    backing_broker: "Backing broker",
    account_currency: "Account currency",
    instruments: "Instruments",
  };
  const entries = Object.entries(data);
  return (
    <Card className="border-border">
      <CardContent className="p-5">
        <h3 className="font-display font-bold text-base mb-3">At a glance</h3>
        <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-3">
          {entries.map(([k, v]) => {
            const label = labelMap[k] || k.replace(/_/g, " ");
            let value: React.ReactNode;
            if (Array.isArray(v)) {
              value = (
                <div className="flex flex-wrap gap-1">
                  {v.map((item, i) => (
                    <span key={i} className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-secondary/60 text-foreground border border-border">
                      {String(item)}
                    </span>
                  ))}
                </div>
              );
            } else if (typeof v === "boolean") {
              value = v ? <span className="text-primary text-sm font-bold">Yes</span> : <span className="text-muted-foreground text-sm">No</span>;
            } else {
              value = <span className="text-sm text-foreground/90">{String(v)}</span>;
            }
            return (
              <div key={k} className="flex flex-col gap-1 border-b border-border/40 pb-2 last:border-0">
                <dt className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground capitalize">{label}</dt>
                <dd>{value}</dd>
              </div>
            );
          })}
        </dl>
      </CardContent>
    </Card>
  );
};

const SectionTable = ({ table }: { table: LongReviewTable }) => {
  const headers = Array.isArray(table?.headers) ? table.headers : [];
  const rows = Array.isArray(table?.rows) ? table.rows : [];
  if (headers.length === 0 && rows.length === 0) return null;
  return (
  <div className="my-4 overflow-x-auto rounded-md border border-border">
    <table className="w-full text-sm">
      <thead>
        <tr className="bg-muted/40">
          {headers.map((h, i) => (
            <th key={i} className="px-3 py-2 text-left font-mono text-xs uppercase tracking-wider text-muted-foreground">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, ri) => (
          <tr key={ri} className="border-t border-border/40">
            {(Array.isArray(row) ? row : []).map((cell, ci) => (
              <td key={ci} className="px-3 py-2 text-foreground/85 align-top">{String(cell)}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
    {table.footnote && (
      <p className="text-[11px] font-mono text-muted-foreground italic px-3 py-2 border-t border-border/40 bg-muted/20">{table.footnote}</p>
    )}
  </div>
  );
};

const MidCTA = ({ data, brokerName }: { data: LongReviewData; brokerName: string }) => {
  if (!data.affiliate_cta?.url || data.affiliate_cta.url === "AFFILIATE_PLACEHOLDER") return null;
  return (
    <Card className="border-primary/40 bg-primary/5 my-4">
      <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <div className="min-w-0">
          <p className="font-display font-bold">{data.affiliate_cta.label || `Open ${brokerName} Account`}</p>
          {data.affiliate_cta.friction_reducers && data.affiliate_cta.friction_reducers.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {data.affiliate_cta.friction_reducers.map((f, i) => (
                <span key={i} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-background border border-border text-muted-foreground">
                  {f}
                </span>
              ))}
            </div>
          )}
        </div>
        <Button asChild>
          <a href={data.affiliate_cta.url} target="_blank" rel="sponsored noopener">
            Open Account <ExternalLink className="w-4 h-4 ml-1.5" />
          </a>
        </Button>
      </CardContent>
    </Card>
  );
};

const AuthorCard = ({ author, lastReviewedAt }: { author: LongReviewAuthor; lastReviewedAt?: string }) => {
  if (!author?.name) return null;
  return (
    <Card className="border-border">
      <CardContent className="p-4 flex items-start gap-4">
        {author.avatar_url ? (
          <img src={author.avatar_url} alt={author.name} className="w-12 h-12 rounded-full object-cover border border-border shrink-0" />
        ) : (
          <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center shrink-0">
            <UserCheck className="w-5 h-5 text-primary" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-display font-bold text-sm">{author.name}</p>
            {author.role && <span className="text-[11px] font-mono text-muted-foreground">· {author.role}</span>}
            {author.experience_years != null && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                {author.experience_years}+ yrs
              </span>
            )}
            {lastReviewedAt && (
              <span className="inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                <CheckCircle2 className="w-3 h-3" /> Human-reviewed {lastReviewedAt}
              </span>
            )}
          </div>
          {author.bio && <p className="text-xs text-foreground/75 mt-1 leading-relaxed">{author.bio}</p>}
          {author.sameAs && author.sameAs.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {author.sameAs.map((u, i) => (
                <a key={i} href={u} target="_blank" rel="noopener noreferrer" className="text-[11px] font-mono text-primary hover:underline truncate max-w-[200px]">
                  {u.replace(/^https?:\/\//, "")}
                </a>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const SocialShare = ({ snippet, brokerName, brokerSlug }: { snippet: LongReviewData["social_snippet"]; brokerName: string; brokerSlug: string }) => {
  if (!snippet || (!snippet.x && !snippet.whatsapp && !snippet.telegram)) return null;
  const url = typeof window !== "undefined" ? `${window.location.origin}/brokers/${brokerSlug}` : `/brokers/${brokerSlug}`;
  const enc = (s?: string) => encodeURIComponent(`${s || `Check out our ${brokerName} review`}\n${url}`);
  return (
    <Card className="border-border">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Share2 className="w-3.5 h-3.5 text-muted-foreground" />
          <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Share this review</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {snippet.x && (
            <Button asChild variant="outline" size="sm">
              <a href={`https://twitter.com/intent/tweet?text=${enc(snippet.x)}`} target="_blank" rel="noopener noreferrer">
                <span className="font-bold">𝕏</span> Tweet
              </a>
            </Button>
          )}
          {snippet.whatsapp && (
            <Button asChild variant="outline" size="sm">
              <a href={`https://wa.me/?text=${enc(snippet.whatsapp)}`} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="w-3.5 h-3.5 mr-1" /> WhatsApp
              </a>
            </Button>
          )}
          {snippet.telegram && (
            <Button asChild variant="outline" size="sm">
              <a href={`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(snippet.telegram)}`} target="_blank" rel="noopener noreferrer">
                <Send className="w-3.5 h-3.5 mr-1" /> Telegram
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const ComparisonBlock = ({ block }: { block: LongReviewData["comparison_block"] }) => {
  if (!block?.brokers || block.brokers.length === 0) return null;
  return (
    <Card className="border-border">
      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <GitCompare className="w-4 h-4 text-primary" />
          <h3 className="font-display font-bold text-base">{block.headline || "How it stacks up"}</h3>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {block.brokers.map((b, i) => (
            <Link
              key={i}
              to={b.slug ? `/brokers/${b.slug}` : "#"}
              className="block rounded-md border border-border bg-muted/20 p-3 hover:border-primary/40 hover:bg-primary/5 transition-colors"
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <p className="font-display font-bold text-sm">{b.name || b.slug}</p>
                {b.score != null && <span className="font-mono text-xs text-primary">{b.score}/10</span>}
              </div>
              {b.verdict && <p className="text-xs text-foreground/75 leading-relaxed">{b.verdict}</p>}
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// ===== v4.9 Prop-Firm Insights =====
const PropFirmInsights = ({ data }: { data: LongReviewData }) => {
  const dd = data.drawdown_explainer;
  const pr = data.pass_rate_data;
  const rf = data.red_flag_scan;
  const pv = data.payout_verification;
  const hasAny = dd || pr || (rf && (rf.flags_found ?? 0) > 0) || pv;
  if (!hasAny) return null;

  const flagLabels: Record<string, string> = {
    sudden_rule_changes_90d: "Sudden rule changes (90d)",
    recent_broker_switch_6m: "Recent broker switch (6m)",
    trustpilot_velocity_anomaly: "Trustpilot velocity anomaly",
    discord_mass_complaints_90d: "Discord mass complaints (90d)",
    founder_anonymous: "Anonymous founder",
    registration_mismatch: "Registration jurisdiction mismatch",
    website_age_vs_founded_mismatch: "Website age vs founded year mismatch",
  };
  const activeFlags = rf
    ? Object.entries(flagLabels).filter(([k]) => (rf as Record<string, unknown>)[k] === true).map(([, v]) => v)
    : [];

  return (
    <div className="space-y-4">
      {/* Drawdown Explainer — the money section */}
      {dd && (dd.worked_example || dd.common_killer_scenario) && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <TrendingDown className="w-4 h-4 text-destructive" />
              <h3 className="font-display font-bold text-base">Drawdown — the part that kills accounts</h3>
            </div>
            <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-2 mb-4">
              {dd.daily_dd_base && (
                <div className="text-xs"><dt className="font-mono uppercase tracking-wider text-muted-foreground">Daily DD base</dt><dd className="font-mono text-foreground/90 mt-0.5">{dd.daily_dd_base}</dd></div>
              )}
              {dd.daily_dd_reset_time && (
                <div className="text-xs"><dt className="font-mono uppercase tracking-wider text-muted-foreground">Resets at</dt><dd className="font-mono text-foreground/90 mt-0.5">{dd.daily_dd_reset_time}</dd></div>
              )}
              {dd.max_dd_type && (
                <div className="text-xs"><dt className="font-mono uppercase tracking-wider text-muted-foreground">Max DD type</dt><dd className="font-mono text-foreground/90 mt-0.5">{dd.max_dd_type}</dd></div>
              )}
              {dd.daily_dd_includes_open_trades != null && (
                <div className="text-xs"><dt className="font-mono uppercase tracking-wider text-muted-foreground">Includes open trades</dt><dd className="font-mono text-foreground/90 mt-0.5">{dd.daily_dd_includes_open_trades ? "Yes" : "No"}</dd></div>
              )}
            </dl>
            {dd.worked_example && (
              <div className="rounded-md border-l-2 border-destructive/60 bg-background/40 p-3 mb-3">
                <p className="text-[10px] font-mono uppercase tracking-widest text-destructive mb-1.5">Worked example</p>
                <p className="text-sm text-foreground/85 leading-relaxed whitespace-pre-line">{dd.worked_example}</p>
              </div>
            )}
            {dd.common_killer_scenario && (
              <div className="rounded-md border border-border bg-muted/30 p-3">
                <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1.5">Common killer scenario</p>
                <p className="text-sm text-foreground/80 leading-relaxed">{dd.common_killer_scenario}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Pass Rate */}
      {pr && (pr.claimed_by_firm || pr.naft_estimate) && (
        <Card className="border-border">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-4 h-4 text-primary" />
              <h3 className="font-display font-bold text-base">Pass rate</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {pr.claimed_by_firm && (
                <div className="rounded-md border border-border bg-muted/20 p-3">
                  <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Claimed by firm</p>
                  <p className="font-mono text-lg font-bold text-foreground mt-1">{pr.claimed_by_firm}</p>
                </div>
              )}
              {pr.industry_benchmark && (
                <div className="rounded-md border border-border bg-muted/20 p-3">
                  <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Industry benchmark</p>
                  <p className="font-mono text-lg font-bold text-foreground mt-1">{pr.industry_benchmark}</p>
                </div>
              )}
              {pr.naft_estimate && (
                <div className="rounded-md border border-primary/30 bg-primary/5 p-3">
                  <p className="text-[10px] font-mono uppercase tracking-wider text-primary">NAFT estimate</p>
                  <p className="font-mono text-lg font-bold text-primary mt-1">{pr.naft_estimate}</p>
                </div>
              )}
            </div>
            {pr.note && <p className="text-xs text-muted-foreground italic mt-3">{pr.note}</p>}
          </CardContent>
        </Card>
      )}

      {/* Red Flag Scan — only if flags found */}
      {rf && (rf.flags_found ?? 0) > 0 && (
        <Card className="border-destructive/40 bg-destructive/5">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <AlertOctagon className="w-4 h-4 text-destructive" />
              <h3 className="font-display font-bold text-base">Red flags detected ({rf.flags_found})</h3>
            </div>
            <div className="flex flex-wrap gap-2 mb-2">
              {activeFlags.map((label, i) => (
                <span key={i} className="text-[11px] font-mono px-2 py-1 rounded-full border border-destructive/40 bg-destructive/10 text-destructive">
                  {label}
                </span>
              ))}
            </div>
            {rf.notes && <p className="text-sm text-foreground/80 leading-relaxed mt-2">{rf.notes}</p>}
          </CardContent>
        </Card>
      )}

      {/* Payout Verification */}
      {pv && (pv.verified_payouts_seen != null || pv.largest_single_payout_seen || pv.average_processing_days) && (
        <Card className="border-border">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Wallet className="w-4 h-4 text-primary" />
              <h3 className="font-display font-bold text-base">Payout verification</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {pv.verified_payouts_seen != null && (
                <div className="rounded-md border border-border bg-muted/20 p-3">
                  <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Verified payouts</p>
                  <p className="font-mono text-lg font-bold text-foreground mt-1">{pv.verified_payouts_seen}</p>
                </div>
              )}
              {pv.largest_single_payout_seen && (
                <div className="rounded-md border border-border bg-muted/20 p-3">
                  <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Largest payout</p>
                  <p className="font-mono text-lg font-bold text-foreground mt-1">{pv.largest_single_payout_seen}</p>
                </div>
              )}
              {pv.average_processing_days && (
                <div className="rounded-md border border-border bg-muted/20 p-3">
                  <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Avg processing</p>
                  <p className="font-mono text-lg font-bold text-foreground mt-1">{pv.average_processing_days}</p>
                </div>
              )}
              {pv.payout_denial_reports_90d != null && (
                <div className={`rounded-md border p-3 ${pv.payout_denial_reports_90d > 0 ? "border-destructive/40 bg-destructive/10" : "border-border bg-muted/20"}`}>
                  <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Denials (90d)</p>
                  <p className={`font-mono text-lg font-bold mt-1 ${pv.payout_denial_reports_90d > 0 ? "text-destructive" : "text-foreground"}`}>{pv.payout_denial_reports_90d}</p>
                </div>
              )}
            </div>
            {pv.payout_consistency_note && (
              <p className="text-xs text-muted-foreground italic mt-3">{pv.payout_consistency_note}</p>
            )}
            {pv.denial_context && pv.payout_denial_reports_90d ? (
              <p className="text-xs text-destructive/80 mt-2">{pv.denial_context}</p>
            ) : null}
            {pv.verification_method && (
              <p className="text-[10px] font-mono text-muted-foreground mt-3 pt-2 border-t border-border/40">Source: {pv.verification_method}</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const LongReview = ({ brokerName, brokerSlug, data }: Props) => {
  const sections = data.sections || [];
  const toc = useMemo(() => {
    if (data.toc && data.toc.length > 0) return data.toc.map(t => ({ id: t.id, heading: t.label }));
    return sections.map(s => ({ id: s.id, heading: s.heading }));
  }, [sections, data.toc]);
  const imagesBySection = useMemo(() => {
    const m: Record<string, LongReviewImageAsset[]> = {};
    (data.image_assets || []).forEach(img => {
      const key = img.section_id || "_unassigned";
      (m[key] ||= []).push(img);
    });
    return m;
  }, [data.image_assets]);
  const [activeId, setActiveId] = useState<string>("");

  // Scrollspy: highlight TOC entry matching the section nearest the top
  useEffect(() => {
    if (typeof window === "undefined") return;
    const ids = [...toc.map(t => t.id), ...(data.faq && data.faq.length > 0 ? ["faq"] : [])];
    const elements = ids.map(id => document.getElementById(id)).filter((el): el is HTMLElement => !!el);
    if (elements.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter(e => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-96px 0px -60% 0px", threshold: [0, 1] }
    );
    elements.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [toc, data.faq]);

  return (
    <div className="mt-6 grid lg:grid-cols-[220px_1fr] gap-8">
      {/* TOC */}
      <aside className="hidden lg:block">
        <div className="sticky top-24 space-y-2">
          <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-3">On this page</p>
          {toc.map(t => {
            const isActive = activeId === t.id;
            return (
              <a
                key={t.id}
                href={`#${t.id}`}
                className={`block text-sm py-1 border-l-2 pl-3 transition-colors ${
                  isActive
                    ? "text-primary border-primary font-semibold bg-primary/5"
                    : "text-foreground/70 border-border hover:text-primary hover:border-primary"
                }`}
              >
                {t.heading}
              </a>
            );
          })}
          {data.faq && data.faq.length > 0 && (
            <a
              href="#faq"
              className={`block text-sm py-1 border-l-2 pl-3 transition-colors ${
                activeId === "faq"
                  ? "text-primary border-primary font-semibold bg-primary/5"
                  : "text-foreground/70 border-border hover:text-primary hover:border-primary"
              }`}
            >
              FAQ
            </a>
          )}
        </div>
      </aside>

      <div className="min-w-0 space-y-6">
        {/* Header chips */}
        <div className="flex flex-wrap items-center gap-2">
          {data.reading_time_minutes && (
            <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-1 rounded-full border border-border bg-muted/30 text-muted-foreground">
              <Clock className="w-3 h-3" /> {data.reading_time_minutes} min read
            </span>
          )}
          {data.word_count && (
            <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-1 rounded-full border border-border bg-muted/30 text-muted-foreground">
              <BookOpen className="w-3 h-3" /> {data.word_count.toLocaleString()} words
            </span>
          )}
          {/* Trustpilot pill — muted (single mention site-wide) */}
          {data.trustpilot?.rating && (
            <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-1 rounded-full border border-border bg-muted/30 text-muted-foreground">
              <Star className="w-3 h-3" /> Trustpilot {data.trustpilot.rating}/5
              {data.trustpilot.reviews ? ` · ${data.trustpilot.reviews.toLocaleString()}` : ""}
            </span>
          )}
        </div>

        {/* Author byline moved to Reviews tab (editorial review row) */}





        {/* Verdict card */}
        {data.verdict && (
          <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-primary" />
                  <h2 className="text-2xl font-display font-bold">Quick Verdict</h2>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  {data.verdict.trust_score != null && (
                    <span className="font-mono"><span className="text-primary font-bold text-lg">{data.verdict.trust_score}</span>/10 trust</span>
                  )}
                  {data.verdict.star_rating != null && (
                    <span className="flex items-center gap-1 font-mono">
                      <Star className="w-4 h-4 fill-primary text-primary" />
                      <span className="font-bold">{data.verdict.star_rating}</span>/5
                    </span>
                  )}
                </div>
              </div>
              {data.verdict.summary && <p className="text-foreground/85 leading-relaxed whitespace-pre-line">{stripDots(data.verdict.summary)}</p>}
              <div className="grid sm:grid-cols-2 gap-3 pt-2">
                {data.verdict.best_for && (
                  <div className="rounded-md border border-primary/20 bg-primary/5 p-3">
                    <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-primary mb-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Best for
                    </div>
                    <p className="text-sm text-foreground/80">{data.verdict.best_for}</p>
                  </div>
                )}
                {data.verdict.not_ideal_for && (
                  <div className="rounded-md border border-destructive/20 bg-destructive/5 p-3">
                    <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-destructive mb-1">
                      <XCircle className="w-3.5 h-3.5" /> Not ideal for
                    </div>
                    <p className="text-sm text-foreground/80">{data.verdict.not_ideal_for}</p>
                  </div>
                )}
              </div>
              {data.verdict.bottom_line && (
                <p className="text-sm text-foreground/75 italic border-l-2 border-primary/40 pl-3">{data.verdict.bottom_line}</p>
              )}
              {data.verdict.trust_breakdown && data.verdict.trust_breakdown.length > 0 && (
                <div className="pt-3 border-t border-border/60 space-y-2">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">NAFT Trust Breakdown</p>
                    <p className="text-[10px] font-mono text-muted-foreground">
                      Total <span className="text-primary font-bold">{data.verdict.trust_score}</span>/10
                    </p>
                  </div>
                  {data.verdict.trust_breakdown.map((b, i) => {
                    const pct = Math.round((b.score / b.max) * 100);
                    return (
                      <div key={i} className="flex items-center gap-3 text-xs">
                        <span className="w-44 shrink-0 text-foreground/80 truncate flex items-center gap-1.5" title={b.label}>
                          {b.label}
                          {b.weight != null && (
                            <span className="text-[9px] font-mono text-muted-foreground bg-muted/60 px-1 py-0.5 rounded">{Math.round(b.weight * 100)}%</span>
                          )}
                        </span>
                        <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                          <div className="h-full rounded-full bg-primary/70" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="w-14 text-right font-mono text-muted-foreground tabular-nums">{b.score}/{b.max}</span>
                      </div>
                    );
                  })}
                  {data.verdict.trust_breakdown.some(b => b.weight != null) && (
                    <p className="text-[10px] font-mono text-muted-foreground pt-1 border-t border-border/40">
                      Weighted total = <span className="text-primary font-bold">{data.verdict.trust_score}</span>/10
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Hot Take */}
        {data.hot_take && (
          <Card className="border-destructive/40 bg-destructive/5">
            <CardContent className="p-5 flex gap-3">
              <Flame className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="text-[10px] font-mono uppercase tracking-widest text-destructive mb-1.5">Hot Take</p>
                <p className="text-foreground/90 leading-relaxed text-sm whitespace-pre-line">{stripDots(data.hot_take)}</p>
              </div>
            </CardContent>
          </Card>
        )}


        {/* At-a-glance */}
        {data.at_a_glance && Object.keys(data.at_a_glance).length > 0 && (
          <AtAGlance data={data.at_a_glance} />
        )}

        {/* v4.9 Prop-Firm Insights */}
        <PropFirmInsights data={data} />

        {/* Geo */}
        {data.geo && <GeoAvailability accepted={data.geo.accepted} excluded={data.geo.excluded} />}

        {/* Sections */}
        {sections.map(s => (
          <div key={s.id}>
            <section id={s.id} className="scroll-mt-24">
              <h2 className="text-2xl font-display font-bold mb-4 pb-2 border-b border-border">{s.heading}</h2>
              <div className="max-w-none">
                {s.body && renderBody(s.body, brokerSlug)}
                {s.table && <SectionTable table={s.table} />}
                {s.bullets && s.bullets.length > 0 && (
                  <ul className="space-y-2 my-3">
                    {s.bullets.map((b, i) => (
                      <li key={i} className="flex gap-2 text-foreground/85 leading-relaxed">
                        <span className="text-primary mt-1.5 shrink-0">▸</span>
                        <span>{stripDots(b)}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {(s.for || s.not_for) && (
                  <div className="grid sm:grid-cols-2 gap-3 my-3">
                    {s.for && (
                      <div className="rounded-md border border-primary/25 bg-primary/5 p-4">
                        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-primary mb-2">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Right fit
                        </div>
                        <ul className="space-y-2">
                          {s.for.map((it, i) => (
                            <li key={i} className="text-sm text-foreground/85 flex gap-2">
                              <CheckCircle2 className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                              <span>{it}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {s.not_for && (
                      <div className="rounded-md border border-destructive/25 bg-destructive/5 p-4">
                        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-destructive mb-2">
                          <XCircle className="w-3.5 h-3.5" /> Wrong fit
                        </div>
                        <ul className="space-y-2">
                          {s.not_for.map((it, i) => (
                            <li key={i} className="text-sm text-foreground/85 flex gap-2">
                              <XCircle className="w-3.5 h-3.5 text-destructive mt-0.5 shrink-0" />
                              <span>{it}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
                {s.steps && s.steps.length > 0 && (
                  <ol className="space-y-4 my-4">
                    {s.steps.map((step, i) => (
                      <li key={i} className="flex gap-4">
                        <div className="shrink-0 w-9 h-9 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center font-display font-bold text-primary">
                          {step.number}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-display font-bold text-base mb-1">{step.title}</h4>
                          <p className="text-foreground/85 leading-relaxed text-sm">{stripDots(step.detail)}</p>
                          {step.cta_inline && step.cta_inline.url !== "AFFILIATE_PLACEHOLDER" && (
                            <Button asChild size="sm" className="mt-2">
                              <a href={step.cta_inline.url} target="_blank" rel="sponsored noopener">
                                {step.cta_inline.label} <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                              </a>
                            </Button>
                          )}
                          {step.cta_inline && step.cta_inline.url === "AFFILIATE_PLACEHOLDER" && data.affiliate_cta?.url && data.affiliate_cta.url !== "AFFILIATE_PLACEHOLDER" && (
                            <Button asChild size="sm" className="mt-2">
                              <a href={data.affiliate_cta.url} target="_blank" rel="sponsored noopener">
                                {step.cta_inline.label} <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                              </a>
                            </Button>
                          )}
                        </div>
                      </li>
                    ))}
                  </ol>
                )}
                {s.practical_note && (
                  <div className="mt-4 rounded-md border-l-2 border-primary/40 bg-muted/30 p-3 text-sm text-foreground/80 italic">
                    {stripDots(s.practical_note)}
                  </div>
                )}
              </div>
              {imagesBySection[s.id] && imagesBySection[s.id].length > 0 && (
                <div className="grid sm:grid-cols-2 gap-3 mt-4">
                  {imagesBySection[s.id].map((img, i) => img.url && (
                    <figure key={i} className="rounded-md border border-border overflow-hidden bg-muted/20">
                      <img src={img.url} alt={img.alt || `${brokerName} ${s.heading}`} loading="lazy" className="w-full h-auto block" />
                      {img.caption && <figcaption className="text-[11px] font-mono text-muted-foreground px-2 py-1.5">{img.caption}</figcaption>}
                    </figure>
                  ))}
                </div>
              )}
            </section>
            {s.cta_after && <MidCTA data={data} brokerName={brokerName} />}
          </div>
        ))}

        {/* Comparison block (v4.7) */}
        {data.comparison_block && <ComparisonBlock block={data.comparison_block} />}


        {/* Final affiliate CTA */}
        {data.affiliate_cta?.url && data.affiliate_cta.url !== "AFFILIATE_PLACEHOLDER" && (
          <Card className="border-primary/40 bg-primary/5">
            <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
              <div>
                <p className="font-display text-lg font-semibold">Ready to open an account?</p>
                <p className="text-sm text-muted-foreground">Test with a small deposit first.</p>
              </div>
              <div className="flex flex-col items-stretch sm:items-end gap-2">
                <Button asChild size="lg">
                  <a href={data.affiliate_cta.url} target="_blank" rel="sponsored noopener">
                    {data.affiliate_cta.label || `Open ${brokerName} Account`} <ExternalLink className="w-4 h-4 ml-2" />
                  </a>
                </Button>
                <AffiliateDisclosure />
                {data.conflict_note && (
                  <p className="text-[10px] font-mono text-muted-foreground italic max-w-xs sm:text-right">{data.conflict_note}</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Social share (v4.7) */}
        {data.social_snippet && <SocialShare snippet={data.social_snippet} brokerName={brokerName} brokerSlug={brokerSlug} />}


        {/* FAQ */}
        {data.faq && data.faq.length > 0 && (
          <section id="faq" className="scroll-mt-24">
            <h2 className="text-2xl font-display font-bold mb-4 pb-2 border-b border-border">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible className="w-full">
              {data.faq.map((f, i) => (
                <AccordionItem key={i} value={`faq-${i}`}>
                  <AccordionTrigger className="text-left font-display">{f.q}</AccordionTrigger>
                  <AccordionContent className="text-foreground/80 leading-relaxed whitespace-pre-line">{stripDots(f.a)}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>
        )}

        {/* Internal links */}
        {data.internal_links && data.internal_links.length > 0 && (
          <section>
            <h3 className="font-display font-bold text-base mb-3">Related</h3>
            <ul className="grid sm:grid-cols-2 gap-2">
              {data.internal_links.map((l, i) => (
                <li key={i}>
                  <Link to={l.url} className="text-sm text-primary hover:underline">→ {l.anchor}</Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
};

export default LongReview;
