import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, X, ArrowUp, ArrowDown } from "lucide-react";

// ===== Types =====
export interface LREditorTable {
  headers: string;       // CSV
  rows: string;          // newline-separated, cells pipe-separated
  footnote: string;
}
export interface LREditorSection {
  id: string;
  heading: string;
  body: string;
  table: LREditorTable;
  bullets: string;       // newline
  for_list: string;      // newline
  not_for: string;       // newline
  practical_note: string;
}
export interface LREditorTrustRow { label: string; score: string; max: string; weight: string; }
export interface LREditorKV { key: string; value: string; }
export interface LREditorFaq { q: string; a: string; }

export interface LREditorState {
  // Verdict
  tldr: string;
  summary: string;
  best_for: string;
  not_ideal_for: string;
  bottom_line: string;
  star_rating: string;
  trust_score: string;
  trust_breakdown: LREditorTrustRow[];
  // At a glance
  at_a_glance: LREditorKV[];
  // Geo
  geo_accepted: string;  // CSV
  geo_excluded: string;  // CSV
  // Sections
  sections: LREditorSection[];
  // Affiliate CTA
  cta_label: string;
  cta_url: string;
  cta_promo_code: string;
  cta_friction: string;  // newline
  // Trustpilot
  tp_rating: string;
  tp_reviews: string;
  tp_source_note: string;
  // FAQ
  faq: LREditorFaq[];
  // Meta
  reading_time_minutes: string;
  word_count: string;
}

export const emptyLREditor: LREditorState = {
  tldr: "", summary: "", best_for: "", not_ideal_for: "", bottom_line: "",
  star_rating: "", trust_score: "", trust_breakdown: [],
  at_a_glance: [],
  geo_accepted: "", geo_excluded: "",
  sections: [],
  cta_label: "", cta_url: "", cta_promo_code: "", cta_friction: "",
  tp_rating: "", tp_reviews: "", tp_source_note: "",
  faq: [],
  reading_time_minutes: "", word_count: "",
};

const emptySection = (): LREditorSection => ({
  id: "", heading: "", body: "",
  table: { headers: "", rows: "", footnote: "" },
  bullets: "", for_list: "", not_for: "", practical_note: "",
});

// ===== Build canonical JSON from editor state =====
const splitLines = (s: string) => s.split("\n").map(x => x.trim()).filter(Boolean);
const splitCsv = (s: string) => s.split(",").map(x => x.trim()).filter(Boolean);
const num = (s: string) => { const n = parseFloat(s); return isNaN(n) ? undefined : n; };

export function buildLongReview(st: LREditorState) {
  const out: any = {};

  // Verdict
  const verdict: any = {};
  if (st.tldr) verdict.tldr = st.tldr;
  if (st.summary) verdict.summary = st.summary;
  if (st.best_for) verdict.best_for = st.best_for;
  if (st.not_ideal_for) verdict.not_ideal_for = st.not_ideal_for;
  if (st.bottom_line) verdict.bottom_line = st.bottom_line;
  if (num(st.star_rating) !== undefined) verdict.star_rating = num(st.star_rating);
  if (num(st.trust_score) !== undefined) verdict.trust_score = num(st.trust_score);
  const tb = st.trust_breakdown
    .filter(r => r.label.trim())
    .map(r => ({
      label: r.label.trim(),
      score: num(r.score) ?? 0,
      max: num(r.max) ?? 10,
      ...(num(r.weight) !== undefined ? { weight: num(r.weight) } : {}),
    }));
  if (tb.length) verdict.trust_breakdown = tb;
  if (Object.keys(verdict).length) out.verdict = verdict;

  // At a glance
  const ag: Record<string, string> = {};
  st.at_a_glance.forEach(kv => { if (kv.key.trim()) ag[kv.key.trim()] = kv.value; });
  if (Object.keys(ag).length) out.at_a_glance = ag;

  // Geo
  const geo: any = {};
  if (st.geo_accepted) geo.accepted = splitCsv(st.geo_accepted);
  if (st.geo_excluded) geo.excluded = splitCsv(st.geo_excluded);
  if (Object.keys(geo).length) out.geo = geo;

  // Sections
  const sections = st.sections
    .filter(s => s.id.trim() || s.heading.trim())
    .map(s => {
      const sec: any = {
        id: s.id.trim() || s.heading.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
        heading: s.heading,
      };
      if (s.body) sec.body = s.body;
      if (s.table.headers && s.table.rows) {
        sec.table = {
          headers: splitCsv(s.table.headers),
          rows: splitLines(s.table.rows).map(r => r.split("|").map(c => c.trim())),
          ...(s.table.footnote ? { footnote: s.table.footnote } : {}),
        };
      }
      const b = splitLines(s.bullets); if (b.length) sec.bullets = b;
      const f = splitLines(s.for_list); if (f.length) sec.for = f;
      const nf = splitLines(s.not_for); if (nf.length) sec.not_for = nf;
      if (s.practical_note) sec.practical_note = s.practical_note;
      return sec;
    });
  if (sections.length) out.sections = sections;

  // CTA
  const cta: any = {};
  if (st.cta_label) cta.label = st.cta_label;
  if (st.cta_url) cta.url = st.cta_url;
  if (st.cta_promo_code) cta.promo_code = st.cta_promo_code;
  const fr = splitLines(st.cta_friction); if (fr.length) cta.friction_reducers = fr;
  if (Object.keys(cta).length) out.affiliate_cta = cta;

  // Trustpilot
  const tp: any = {};
  if (num(st.tp_rating) !== undefined) tp.rating = num(st.tp_rating);
  if (num(st.tp_reviews) !== undefined) tp.reviews = num(st.tp_reviews);
  if (st.tp_source_note) tp.source_note = st.tp_source_note;
  if (Object.keys(tp).length) out.trustpilot = tp;

  // FAQ
  const faq = st.faq.filter(f => f.q.trim() && f.a.trim()).map(f => ({ q: f.q, a: f.a }));
  if (faq.length) out.faq = faq;

  // Meta
  if (num(st.reading_time_minutes) !== undefined) out.reading_time_minutes = num(st.reading_time_minutes);
  if (num(st.word_count) !== undefined) out.word_count = num(st.word_count);

  return Object.keys(out).length ? out : null;
}

// ===== Parse existing long_review JSON back into editor state =====
export function parseLongReview(lr: any): LREditorState {
  if (!lr || typeof lr !== "object") return { ...emptyLREditor };
  const v = lr.verdict || {};
  const ag = lr.at_a_glance || {};
  const geo = lr.geo || {};
  const cta = lr.affiliate_cta || {};
  const tp = lr.trustpilot || {};
  return {
    tldr: v.tldr || "",
    summary: v.summary || "",
    best_for: v.best_for || "",
    not_ideal_for: v.not_ideal_for || "",
    bottom_line: v.bottom_line || "",
    star_rating: v.star_rating != null ? String(v.star_rating) : "",
    trust_score: v.trust_score != null ? String(v.trust_score) : "",
    trust_breakdown: Array.isArray(v.trust_breakdown)
      ? v.trust_breakdown.map((r: any) => ({
          label: r.label || "", score: String(r.score ?? ""), max: String(r.max ?? ""), weight: r.weight != null ? String(r.weight) : "",
        }))
      : [],
    at_a_glance: Object.entries(ag).map(([k, val]) => ({ key: k, value: String(val ?? "") })),
    geo_accepted: Array.isArray(geo.accepted) ? geo.accepted.join(", ") : "",
    geo_excluded: Array.isArray(geo.excluded) ? geo.excluded.join(", ") : "",
    sections: Array.isArray(lr.sections) ? lr.sections.map((s: any) => ({
      id: s.id || "",
      heading: s.heading || "",
      body: s.body || "",
      table: {
        headers: Array.isArray(s.table?.headers) ? s.table.headers.join(", ") : "",
        rows: Array.isArray(s.table?.rows) ? s.table.rows.map((r: any[]) => r.join(" | ")).join("\n") : "",
        footnote: s.table?.footnote || "",
      },
      bullets: Array.isArray(s.bullets) ? s.bullets.join("\n") : "",
      for_list: Array.isArray(s.for) ? s.for.join("\n") : "",
      not_for: Array.isArray(s.not_for) ? s.not_for.join("\n") : "",
      practical_note: s.practical_note || "",
    })) : [],
    cta_label: cta.label || "",
    cta_url: cta.url || "",
    cta_promo_code: cta.promo_code || "",
    cta_friction: Array.isArray(cta.friction_reducers) ? cta.friction_reducers.join("\n") : "",
    tp_rating: tp.rating != null ? String(tp.rating) : "",
    tp_reviews: tp.reviews != null ? String(tp.reviews) : "",
    tp_source_note: tp.source_note || "",
    faq: Array.isArray(lr.faq) ? lr.faq.map((f: any) => ({ q: f.q || "", a: f.a || "" })) : [],
    reading_time_minutes: lr.reading_time_minutes != null ? String(lr.reading_time_minutes) : "",
    word_count: lr.word_count != null ? String(lr.word_count) : "",
  };
}

// ===== UI =====
interface Props {
  value: LREditorState;
  onChange: (v: LREditorState) => void;
}

const SECTION_PRESETS = [
  "quick-verdict", "regulation-safety", "geo-availability",
  "spreads-accounts-fees", "deposits-withdrawals", "platforms-tools",
  "pros-cons", "final-verdict",
];

export const LongReviewEditor = ({ value: st, onChange }: Props) => {
  const set = (patch: Partial<LREditorState>) => onChange({ ...st, ...patch });

  // Trust breakdown helpers
  const addTrust = () => set({ trust_breakdown: [...st.trust_breakdown, { label: "", score: "", max: "10", weight: "" }] });
  const updTrust = (i: number, k: keyof LREditorTrustRow, v: string) => {
    const arr = [...st.trust_breakdown]; arr[i] = { ...arr[i], [k]: v }; set({ trust_breakdown: arr });
  };
  const rmTrust = (i: number) => set({ trust_breakdown: st.trust_breakdown.filter((_, idx) => idx !== i) });

  // At-a-glance helpers
  const addKV = () => set({ at_a_glance: [...st.at_a_glance, { key: "", value: "" }] });
  const updKV = (i: number, k: "key" | "value", v: string) => {
    const arr = [...st.at_a_glance]; arr[i] = { ...arr[i], [k]: v }; set({ at_a_glance: arr });
  };
  const rmKV = (i: number) => set({ at_a_glance: st.at_a_glance.filter((_, idx) => idx !== i) });

  // Section helpers
  const addSection = () => set({ sections: [...st.sections, emptySection()] });
  const updSection = (i: number, patch: Partial<LREditorSection>) => {
    const arr = [...st.sections]; arr[i] = { ...arr[i], ...patch }; set({ sections: arr });
  };
  const updSectionTable = (i: number, patch: Partial<LREditorTable>) => {
    const arr = [...st.sections]; arr[i] = { ...arr[i], table: { ...arr[i].table, ...patch } }; set({ sections: arr });
  };
  const rmSection = (i: number) => set({ sections: st.sections.filter((_, idx) => idx !== i) });
  const moveSection = (i: number, dir: -1 | 1) => {
    const j = i + dir; if (j < 0 || j >= st.sections.length) return;
    const arr = [...st.sections]; [arr[i], arr[j]] = [arr[j], arr[i]]; set({ sections: arr });
  };

  // FAQ helpers
  const addFaq = () => set({ faq: [...st.faq, { q: "", a: "" }] });
  const updFaq = (i: number, k: "q" | "a", v: string) => {
    const arr = [...st.faq]; arr[i] = { ...arr[i], [k]: v }; set({ faq: arr });
  };
  const rmFaq = (i: number) => set({ faq: st.faq.filter((_, idx) => idx !== i) });

  return (
    <div className="space-y-5">
      {/* === Verdict === */}
      <div className="rounded-lg border border-border p-4 space-y-3">
        <Label className="text-base">Verdict (hero scorecard)</Label>
        <div><Label className="text-xs">TL;DR (1–2 lines)</Label>
          <Textarea rows={2} value={st.tldr} onChange={e => set({ tldr: e.target.value })} placeholder="In one breath: who this broker is for + the headline trade-off." /></div>
        <div><Label className="text-xs">Summary (longer paragraph, optional)</Label>
          <Textarea rows={3} value={st.summary} onChange={e => set({ summary: e.target.value })} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><Label className="text-xs">Best for</Label><Input value={st.best_for} onChange={e => set({ best_for: e.target.value })} placeholder="Beginners with small accounts" /></div>
          <div><Label className="text-xs">Not ideal for</Label><Input value={st.not_ideal_for} onChange={e => set({ not_ideal_for: e.target.value })} placeholder="Scalpers needing raw ECN spreads" /></div>
        </div>
        <div><Label className="text-xs">Bottom line</Label>
          <Textarea rows={2} value={st.bottom_line} onChange={e => set({ bottom_line: e.target.value })} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><Label className="text-xs">Star rating (0–5)</Label><Input type="number" step="0.1" min="0" max="5" value={st.star_rating} onChange={e => set({ star_rating: e.target.value })} /></div>
          <div><Label className="text-xs">Trust score (0–10)</Label><Input type="number" step="0.1" min="0" max="10" value={st.trust_score} onChange={e => set({ trust_score: e.target.value })} /></div>
        </div>

        <div className="pt-2 border-t border-border/60">
          <div className="flex items-center justify-between mb-2">
            <Label className="text-xs">Trust breakdown rows</Label>
            <Button type="button" size="sm" variant="outline" onClick={addTrust}><Plus className="w-3 h-3 mr-1" /> Add row</Button>
          </div>
          <div className="space-y-2">
            {st.trust_breakdown.map((r, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 items-end">
                <div className="col-span-5"><Label className="text-[10px]">Label</Label><Input value={r.label} onChange={e => updTrust(i, "label", e.target.value)} placeholder="Regulation" /></div>
                <div className="col-span-2"><Label className="text-[10px]">Score</Label><Input value={r.score} onChange={e => updTrust(i, "score", e.target.value)} /></div>
                <div className="col-span-2"><Label className="text-[10px]">Max</Label><Input value={r.max} onChange={e => updTrust(i, "max", e.target.value)} /></div>
                <div className="col-span-2"><Label className="text-[10px]">Weight</Label><Input value={r.weight} onChange={e => updTrust(i, "weight", e.target.value)} /></div>
                <Button type="button" size="sm" variant="ghost" onClick={() => rmTrust(i)}><X className="w-4 h-4 text-destructive" /></Button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* === At a glance === */}
      <div className="rounded-lg border border-border p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <Label className="text-base">At a glance</Label>
            <p className="text-xs text-muted-foreground mt-0.5">Key/value rows shown as the scannable spec table.</p>
          </div>
          <Button type="button" size="sm" variant="outline" onClick={addKV}><Plus className="w-3 h-3 mr-1" /> Add row</Button>
        </div>
        <div className="space-y-2">
          {st.at_a_glance.map((kv, i) => (
            <div key={i} className="grid grid-cols-12 gap-2 items-end">
              <div className="col-span-4"><Label className="text-[10px]">Key</Label><Input value={kv.key} onChange={e => updKV(i, "key", e.target.value)} placeholder="min_deposit" /></div>
              <div className="col-span-7"><Label className="text-[10px]">Value</Label><Input value={kv.value} onChange={e => updKV(i, "value", e.target.value)} placeholder="$5" /></div>
              <Button type="button" size="sm" variant="ghost" onClick={() => rmKV(i)}><X className="w-4 h-4 text-destructive" /></Button>
            </div>
          ))}
          {st.at_a_glance.length === 0 && <p className="text-xs text-muted-foreground text-center py-2">No rows yet.</p>}
        </div>
      </div>

      {/* === Geo === */}
      <div className="rounded-lg border border-border p-4 space-y-3">
        <Label className="text-base">Geo availability</Label>
        <div><Label className="text-xs">Accepted countries (comma-separated)</Label>
          <Input value={st.geo_accepted} onChange={e => set({ geo_accepted: e.target.value })} placeholder="Bangladesh, India, Pakistan, UAE" /></div>
        <div><Label className="text-xs">Excluded countries (comma-separated)</Label>
          <Input value={st.geo_excluded} onChange={e => set({ geo_excluded: e.target.value })} placeholder="United States, Canada, Israel, Iran" /></div>
      </div>

      {/* === Sections === */}
      <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <Label className="text-base">Sections (full review body)</Label>
            <p className="text-xs text-muted-foreground mt-0.5">Add 6–8 sections. Preset IDs: {SECTION_PRESETS.join(" · ")}</p>
          </div>
          <Button type="button" size="sm" variant="outline" onClick={addSection}><Plus className="w-3 h-3 mr-1" /> Add section</Button>
        </div>
        <div className="space-y-4">
          {st.sections.map((s, i) => (
            <div key={i} className="rounded border border-border bg-background p-3 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">#{i + 1} {s.heading || s.id || "Untitled section"}</span>
                <div className="flex gap-1">
                  <Button type="button" size="sm" variant="ghost" onClick={() => moveSection(i, -1)}><ArrowUp className="w-4 h-4" /></Button>
                  <Button type="button" size="sm" variant="ghost" onClick={() => moveSection(i, 1)}><ArrowDown className="w-4 h-4" /></Button>
                  <Button type="button" size="sm" variant="ghost" onClick={() => rmSection(i)}><X className="w-4 h-4 text-destructive" /></Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div><Label className="text-[10px]">ID (slug)</Label>
                  <Input list={`sec-preset-${i}`} value={s.id} onChange={e => updSection(i, { id: e.target.value })} placeholder="spreads-accounts-fees" />
                  <datalist id={`sec-preset-${i}`}>{SECTION_PRESETS.map(p => <option key={p} value={p} />)}</datalist>
                </div>
                <div><Label className="text-[10px]">Heading</Label><Input value={s.heading} onChange={e => updSection(i, { heading: e.target.value })} placeholder="Spreads, Accounts & Fees" /></div>
              </div>
              <div><Label className="text-[10px]">Body (use blank line between paragraphs; [INTERNAL: /path] supported)</Label>
                <Textarea rows={5} value={s.body} onChange={e => updSection(i, { body: e.target.value })} /></div>

              <div className="rounded border border-dashed border-border p-2 space-y-2">
                <Label className="text-[10px] uppercase text-muted-foreground">Optional table</Label>
                <div><Label className="text-[10px]">Headers (comma-separated)</Label>
                  <Input value={s.table.headers} onChange={e => updSectionTable(i, { headers: e.target.value })} placeholder="Account, Min Deposit, Spread, Commission" /></div>
                <div><Label className="text-[10px]">Rows (one per line, cells pipe-separated)</Label>
                  <Textarea rows={4} value={s.table.rows} onChange={e => updSectionTable(i, { rows: e.target.value })} placeholder="Micro | $5 | 1.6 pips | None&#10;Standard | $5 | 1.6 pips | None" /></div>
                <div><Label className="text-[10px]">Footnote</Label>
                  <Input value={s.table.footnote} onChange={e => updSectionTable(i, { footnote: e.target.value })} /></div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div><Label className="text-[10px]">Bullets (one per line)</Label>
                  <Textarea rows={3} value={s.bullets} onChange={e => updSection(i, { bullets: e.target.value })} /></div>
                <div><Label className="text-[10px]">Practical note</Label>
                  <Textarea rows={3} value={s.practical_note} onChange={e => updSection(i, { practical_note: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div><Label className="text-[10px]">"For" list (one per line)</Label>
                  <Textarea rows={3} value={s.for_list} onChange={e => updSection(i, { for_list: e.target.value })} /></div>
                <div><Label className="text-[10px]">"Not for" list (one per line)</Label>
                  <Textarea rows={3} value={s.not_for} onChange={e => updSection(i, { not_for: e.target.value })} /></div>
              </div>
            </div>
          ))}
          {st.sections.length === 0 && <p className="text-xs text-muted-foreground text-center py-3">No sections yet. Click "Add section".</p>}
        </div>
      </div>

      {/* === Affiliate CTA === */}
      <div className="rounded-lg border border-border p-4 space-y-3">
        <Label className="text-base">Affiliate CTA</Label>
        <div className="grid grid-cols-2 gap-3">
          <div><Label className="text-xs">CTA Label</Label><Input value={st.cta_label} onChange={e => set({ cta_label: e.target.value })} placeholder="Open Account" /></div>
          <div><Label className="text-xs">CTA URL</Label><Input value={st.cta_url} onChange={e => set({ cta_url: e.target.value })} placeholder="https://" /></div>
        </div>
        <div><Label className="text-xs">Promo code</Label><Input value={st.cta_promo_code} onChange={e => set({ cta_promo_code: e.target.value })} placeholder="NAFT25" /></div>
        <div><Label className="text-xs">Friction reducers (one per line)</Label>
          <Textarea rows={3} value={st.cta_friction} onChange={e => set({ cta_friction: e.target.value })} placeholder="$5 minimum&#10;MT4/MT5&#10;Swap-free available" /></div>
      </div>

      {/* === Trustpilot === */}
      <div className="rounded-lg border border-border p-4 space-y-3">
        <Label className="text-base">Trustpilot snapshot</Label>
        <div className="grid grid-cols-3 gap-3">
          <div><Label className="text-xs">Rating</Label><Input type="number" step="0.1" value={st.tp_rating} onChange={e => set({ tp_rating: e.target.value })} /></div>
          <div><Label className="text-xs">Reviews</Label><Input type="number" value={st.tp_reviews} onChange={e => set({ tp_reviews: e.target.value })} /></div>
          <div><Label className="text-xs">Source note</Label><Input value={st.tp_source_note} onChange={e => set({ tp_source_note: e.target.value })} /></div>
        </div>
      </div>

      {/* === FAQ === */}
      <div className="rounded-lg border border-border p-4">
        <div className="flex items-center justify-between mb-3">
          <Label className="text-base">FAQ</Label>
          <Button type="button" size="sm" variant="outline" onClick={addFaq}><Plus className="w-3 h-3 mr-1" /> Add FAQ</Button>
        </div>
        <div className="space-y-3">
          {st.faq.map((f, i) => (
            <div key={i} className="rounded border border-border p-2 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">#{i + 1}</span>
                <Button type="button" size="sm" variant="ghost" onClick={() => rmFaq(i)}><X className="w-4 h-4 text-destructive" /></Button>
              </div>
              <Input value={f.q} onChange={e => updFaq(i, "q", e.target.value)} placeholder="Question" />
              <Textarea rows={2} value={f.a} onChange={e => updFaq(i, "a", e.target.value)} placeholder="Answer" />
            </div>
          ))}
          {st.faq.length === 0 && <p className="text-xs text-muted-foreground text-center py-2">No FAQs yet.</p>}
        </div>
      </div>

      {/* === Meta === */}
      <div className="rounded-lg border border-border p-4 space-y-3">
        <Label className="text-base">Meta</Label>
        <div className="grid grid-cols-2 gap-3">
          <div><Label className="text-xs">Reading time (minutes)</Label><Input type="number" value={st.reading_time_minutes} onChange={e => set({ reading_time_minutes: e.target.value })} /></div>
          <div><Label className="text-xs">Word count</Label><Input type="number" value={st.word_count} onChange={e => set({ word_count: e.target.value })} /></div>
        </div>
      </div>
    </div>
  );
};

export default LongReviewEditor;
