import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, AlertCircle, Loader2, FileJson, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import { ENTITIES, getEntity } from "@/lib/researchPrompts";
import { tryParseJson, validate, type ValidationResult } from "@/lib/jsonValidator";
import { importEntity, nestSidecarsIntoLongReview, type BrokerImportMode } from "@/lib/jsonImporter";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface PreviewItem {
  raw: any;
  result: ValidationResult;
}

const ImportJsonAdmin = () => {
  const { user } = useAuth();
  const [entityKey, setEntityKey] = useState(ENTITIES[0].key);
  const [jsonText, setJsonText] = useState("");
  const [previews, setPreviews] = useState<PreviewItem[] | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [inserting, setInserting] = useState(false);
  const [brokerMode, setBrokerMode] = useState<BrokerImportMode>("smart-merge");
  const [autoPublish, setAutoPublish] = useState(false);

  const entity = useMemo(() => getEntity(entityKey)!, [entityKey]);
  const isBroker = entity.table === "brokers";

  // v4.8 sidecars: editorial_review_row wrappers (one per broker payload), routed to `reviews` table
  const [reviewSidecars, setReviewSidecars] = useState<any[]>([]);

  const runPreview = () => {
    setPreviews(null);
    setParseError(null);
    setReviewSidecars([]);
    const parsed = tryParseJson(jsonText);
    if (parsed.ok === false) {
      setParseError(parsed.error);
      return;
    }
    const list = Array.isArray(parsed.data) ? parsed.data : [parsed.data];
    const sidecars: any[] = [];
    const brokerLike: any[] = [];
    for (const raw of list) {
      if (raw && typeof raw === "object" && !Array.isArray(raw) && raw.editorial_review_row && Object.keys(raw).length === 1) {
        sidecars.push(raw.editorial_review_row);
      } else {
        brokerLike.push(isBroker ? nestSidecarsIntoLongReview(raw) : raw);
      }
    }
    setReviewSidecars(sidecars);
    const items: PreviewItem[] = brokerLike.map((raw) => ({
      raw,
      result: validate(raw, entity.schema),
    }));
    setPreviews(items);
  };

  const insertSidecars = async () => {
    if (!isBroker || reviewSidecars.length === 0) return { ok: 0, fail: 0 };
    let ok = 0, fail = 0;
    for (const row of reviewSidecars) {
      // Resolve broker_id from slug if needed
      let broker_id = row.broker_id;
      if (!broker_id && row.broker_slug) {
        const { data: b } = await (supabase as any).from("brokers").select("id").eq("slug", row.broker_slug).maybeSingle();
        broker_id = b?.id;
      }
      if (!broker_id) { fail++; continue; }
      const { broker_slug: _bs, author_name, ...rest } = row;
      // Map sidecar `author_name` → DB column `author`
      const author = author_name ?? rest.author;
      const payload: any = { ...rest, broker_id };
      if (author) payload.author = author;
      // Replace any existing editorial review for this broker (idempotent re-import)
      if (author) {
        await (supabase as any).from("reviews").delete().eq("broker_id", broker_id).eq("author", author);
      }
      const { error } = await (supabase as any).from("reviews").insert(payload);
      if (error) fail++; else ok++;
    }
    return { ok, fail };
  };

  const insertOne = async (item: PreviewItem) => {
    if (!item.result.valid) {
      toast.error("Fix validation errors first");
      return;
    }
    setInserting(true);
    const res = await importEntity(entity, item.result.cleaned, user?.id || null, isBroker ? brokerMode : "insert", autoPublish);
    setInserting(false);
    if (res.success) {
      if (res.mode === "smart-merge" || res.mode === "overwrite") {
        toast.success(`${res.mode === "overwrite" ? "Overwrote" : "Smart-merged"} broker · ${res.updated?.length || 0} fields updated, ${res.preserved?.length || 0} preserved`);
      } else {
        toast.success(`Inserted as ${autoPublish ? "published" : "draft"} (id: ${res.id?.slice(0, 8)}…)`);
      }
      if (isBroker && reviewSidecars.length > 0) {
        const { ok, fail } = await insertSidecars();
        toast[fail === 0 ? "success" : "warning"](`Editorial review sidecar · ${ok} inserted${fail ? `, ${fail} failed` : ""}`);
      }
    } else {
      toast.error(res.error || "Insert failed");
    }
  };

  const insertAll = async () => {
    if (!previews) return;
    const valid = previews.filter((p) => p.result.valid);
    if (valid.length === 0 && reviewSidecars.length === 0) {
      toast.error("No valid records to insert");
      return;
    }
    setInserting(true);
    let okCount = 0;
    let failCount = 0;
    for (const item of valid) {
      const res = await importEntity(entity, item.result.cleaned, user?.id || null, isBroker ? brokerMode : "insert", autoPublish);
      if (res.success) okCount++;
      else failCount++;
    }
    let sidecarMsg = "";
    if (isBroker && reviewSidecars.length > 0) {
      const { ok, fail } = await insertSidecars();
      sidecarMsg = ` · editorial sidecar: ${ok} ok${fail ? `, ${fail} failed` : ""}`;
    }
    setInserting(false);
    toast[failCount === 0 ? "success" : "warning"](
      `Processed ${okCount} / ${valid.length}${failCount > 0 ? ` (${failCount} failed)` : ""}${sidecarMsg}`
    );
  };

  const validCount = previews?.filter((p) => p.result.valid).length ?? 0;
  const totalCount = previews?.length ?? 0;

  return (
    <div className="space-y-6">
      <SEO title="Import JSON | NAFT Admin" description="Paste agent-researched JSON and insert as draft content." />

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-condensed uppercase tracking-tight">Import JSON</h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Paste a JSON object (or array of objects) from your research agent. The system will validate, preview, and
            insert as a draft into the right table.
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link to="/admin/research-prompts">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Prompts
          </Link>
        </Button>
      </div>

      <Card className="p-4 space-y-4">
        <div className="grid sm:grid-cols-[240px_1fr] gap-4 items-end">
          <div>
            <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Entity Type</Label>
            <Select value={entityKey} onValueChange={setEntityKey}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ENTITIES.map((e) => (
                  <SelectItem key={e.key} value={e.key}>
                    {e.label} <span className="text-muted-foreground ml-1">({e.table})</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="text-xs text-muted-foreground space-y-2">
            <div>
              <span className="font-mono">Target table:</span>{" "}
              <Badge variant="outline" className="font-mono">{entity.table}</Badge>{" "}
              — inserts as <Badge variant="outline" className="font-mono">{autoPublish ? "published" : "draft"}</Badge> where supported.
            </div>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={autoPublish}
                onChange={(e) => setAutoPublish(e.target.checked)}
                className="h-4 w-4 rounded border-input accent-primary"
              />
              <span className="font-mono uppercase tracking-wider">Auto-publish on insert</span>
              <span className="text-muted-foreground/70">(sets status = published instead of draft)</span>
            </label>
          </div>
        </div>

        {isBroker && (
          <div className="grid sm:grid-cols-[240px_1fr] gap-4 items-end">
            <div>
              <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Existing broker mode</Label>
              <Select value={brokerMode} onValueChange={(v) => setBrokerMode(v as BrokerImportMode)}>
                <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="smart-merge">Smart merge (recommended)</SelectItem>
                  <SelectItem value="overwrite">Overwrite all fields</SelectItem>
                  <SelectItem value="insert">Always insert (auto-replace on duplicate slug)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs text-muted-foreground">
              <strong>Smart merge:</strong> existing broker → <code className="font-mono">long_review</code> fully replaced; top-level fields only filled when empty (manual edits preserved). <strong>Insert mode:</strong> now auto-overwrites any broker with the same slug instead of failing on duplicates — safe to re-run.
            </p>
          </div>
        )}


        <div>
          <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
            JSON Payload
          </Label>
          <Textarea
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            placeholder={`Paste the agent's JSON here. Single object or array of objects.\n\n{\n  "name": "...",\n  ...\n}`}
            className="mt-2 min-h-[280px] font-mono text-xs"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button onClick={runPreview} disabled={!jsonText.trim()}>
            <FileJson className="h-4 w-4 mr-2" />
            Validate &amp; Preview
          </Button>
          {previews && validCount > 0 && (
            <Button variant="default" onClick={insertAll} disabled={inserting}>
              {inserting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4 mr-2" />
              )}
              Insert All Valid ({validCount})
            </Button>
          )}
        </div>

        {parseError && (
          <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm">
            <div className="flex items-center gap-2 font-medium text-destructive">
              <AlertCircle className="h-4 w-4" /> JSON parse error
            </div>
            <p className="mt-1 text-xs font-mono">{parseError}</p>
          </div>
        )}
      </Card>

      {previews && (
        <Card className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-condensed uppercase">
              Preview ({validCount} / {totalCount} valid){reviewSidecars.length > 0 ? ` · +${reviewSidecars.length} editorial review sidecar${reviewSidecars.length > 1 ? "s" : ""}` : ""}
            </h2>
          </div>

          {previews.map((item, idx) => {
            const errors = item.result.issues.filter((i) => i.severity === "error");
            const warnings = item.result.issues.filter((i) => i.severity === "warning");
            const titleField = item.raw?.name || item.raw?.title || item.raw?.pair || `Record ${idx + 1}`;
            return (
              <Card key={idx} className="p-4">
                <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
                  <div className="flex items-center gap-2">
                    {item.result.valid ? (
                      <Badge className="bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/20 border-emerald-500/30">
                        <CheckCircle2 className="h-3 w-3 mr-1" /> Valid
                      </Badge>
                    ) : (
                      <Badge variant="destructive">
                        <AlertCircle className="h-3 w-3 mr-1" /> {errors.length} error{errors.length !== 1 ? "s" : ""}
                      </Badge>
                    )}
                    {warnings.length > 0 && (
                      <Badge variant="outline" className="text-amber-600 border-amber-500/40">
                        {warnings.length} warning{warnings.length !== 1 ? "s" : ""}
                      </Badge>
                    )}
                    <span className="font-mono text-sm">{String(titleField).slice(0, 60)}</span>
                  </div>
                  <Button size="sm" onClick={() => insertOne(item)} disabled={!item.result.valid || inserting}>
                    Insert as Draft
                  </Button>
                </div>

                {item.result.issues.length > 0 && (
                  <div className="space-y-1 mb-3">
                    {item.result.issues.map((iss, i) => (
                      <div
                        key={i}
                        className={`text-xs font-mono px-2 py-1 rounded ${
                          iss.severity === "error"
                            ? "bg-destructive/10 text-destructive"
                            : "bg-amber-500/10 text-amber-700 dark:text-amber-400"
                        }`}
                      >
                        <span className="font-bold">{iss.field}</span> — {iss.message}
                      </div>
                    ))}
                  </div>
                )}

                <pre className="text-[11px] font-mono leading-relaxed bg-muted/30 p-3 rounded-md max-h-[260px] overflow-auto">
                  {JSON.stringify(item.result.cleaned, null, 2)}
                </pre>
              </Card>
            );
          })}
        </Card>
      )}
    </div>
  );
};

export default ImportJsonAdmin;
