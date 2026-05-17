import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AffiliateDisclosure from "@/components/common/AffiliateDisclosure";
import { Star, ShieldCheck, ExternalLink, CheckCircle2, XCircle } from "lucide-react";

export interface LongReviewSection { id: string; heading: string; body: string; }
export interface LongReviewFaq { q: string; a: string; }
export interface LongReviewData {
  seo?: { title?: string; description?: string; og_image_alt?: string; focus_keyword?: string; secondary_keywords?: string[] };
  verdict?: { summary?: string; tldr?: string; best_for?: string; not_ideal_for?: string; trust_score?: number; star_rating?: number };
  sections?: LongReviewSection[];
  faq?: LongReviewFaq[];
  affiliate_cta?: { label?: string; url?: string };
  factuality_legend?: boolean;
}

const FACTUALITY_ITEMS: { dot: string; label: string }[] = [
  { dot: "🟢", label: "Broker-advertised" },
  { dot: "🔵", label: "Community-reported" },
  { dot: "🟡", label: "Third-party reviewed" },
  { dot: "🔴", label: "Could not independently verify" },
  { dot: "⚪", label: "NAFT editorial" },
];

interface Props { brokerName: string; brokerSlug: string; data: LongReviewData; onScrollToReviews?: () => void; }

// Map [INTERNAL LINK: …] placeholders to real routes
const linkMap = (slug: string): { test: RegExp; to: string; sameTab?: boolean }[] => [
  { test: /how we review|how we verify/i, to: "/how-we-review" },
  { test: /withdrawal proofs/i, to: `/brokers/${slug}#reviews-anchor` },
  { test: /how naft calculates|trust score/i, to: "/how-we-review" },
  { test: /vs xm|exness vs/i, to: `/compare?brokers=${slug},xm-global` },
  { test: /file a complaint/i, to: "/file-complaint" },
  { test: /write a review/i, to: `/brokers/${slug}#reviews-anchor` },
];

// Render body text: split paragraphs, convert [INTERNAL LINK: ...] tokens to Links.
function renderBody(text: string, slug: string) {
  const map = linkMap(slug);
  const paragraphs = text.split(/\n{2,}|\n(?=\d+\.\s)/).map(p => p.trim()).filter(Boolean);
  return paragraphs.map((p, i) => {
    const parts: (string | JSX.Element)[] = [];
    const re = /\[INTERNAL LINK:\s*([^\]]+)\]|\[AFFILIATE LINK PLACEHOLDER[^\]]*\]/gi;
    let last = 0; let m: RegExpExecArray | null; let key = 0;
    while ((m = re.exec(p)) !== null) {
      if (m.index > last) parts.push(p.slice(last, m.index));
      if (m[0].toUpperCase().includes("AFFILIATE")) {
        parts.push(<span key={`a-${i}-${key++}`} className="inline-block text-xs font-mono text-muted-foreground">[affiliate link below]</span>);
      } else {
        const label = m[1].trim();
        const match = map.find(x => x.test.test(label));
        parts.push(
          <Link key={`l-${i}-${key++}`} to={match?.to || "#"} className="text-primary underline underline-offset-2 hover:text-primary/80">
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

const LongReview = ({ brokerName, brokerSlug, data }: Props) => {
  const sections = data.sections || [];
  const toc = useMemo(() => sections.map(s => ({ id: s.id, heading: s.heading })), [sections]);

  return (
    <div className="mt-6 grid lg:grid-cols-[220px_1fr] gap-8">
      {/* TOC */}
      <aside className="hidden lg:block">
        <div className="sticky top-24 space-y-2">
          <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-3">On this page</p>
          {toc.map(t => (
            <a key={t.id} href={`#${t.id}`} className="block text-sm text-foreground/70 hover:text-primary py-1 border-l-2 border-border hover:border-primary pl-3 transition-colors">
              {t.heading}
            </a>
          ))}
          {data.faq && data.faq.length > 0 && (
            <a href="#faq" className="block text-sm text-foreground/70 hover:text-primary py-1 border-l-2 border-border hover:border-primary pl-3 transition-colors">FAQ</a>
          )}
        </div>
      </aside>

      <div className="min-w-0 space-y-8">
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
              {data.verdict.summary && <p className="text-foreground/85 leading-relaxed">{data.verdict.summary}</p>}
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
            </CardContent>
          </Card>
        )}

        {/* Sections */}
        {sections.map(s => (
          <section key={s.id} id={s.id} className="scroll-mt-24">
            <h2 className="text-2xl font-display font-bold mb-4 pb-2 border-b border-border">{s.heading}</h2>
            <div className="prose prose-invert max-w-none">
              {renderBody(s.body, brokerSlug)}
            </div>
          </section>
        ))}

        {/* Affiliate CTA */}
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
              </div>
            </CardContent>
          </Card>
        )}

        {/* FAQ */}
        {data.faq && data.faq.length > 0 && (
          <section id="faq" className="scroll-mt-24">
            <h2 className="text-2xl font-display font-bold mb-4 pb-2 border-b border-border">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible className="w-full">
              {data.faq.map((f, i) => (
                <AccordionItem key={i} value={`faq-${i}`}>
                  <AccordionTrigger className="text-left font-display">{f.q}</AccordionTrigger>
                  <AccordionContent className="text-foreground/80 leading-relaxed whitespace-pre-line">{f.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>
        )}
      </div>
    </div>
  );
};

export default LongReview;
