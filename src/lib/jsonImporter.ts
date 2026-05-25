import { supabase } from "@/integrations/supabase/client";
import type { EntityDefinition } from "./researchPrompts";

export interface ImportResult {
  success: boolean;
  id?: string;
  error?: string;
  mode?: "insert" | "smart-merge" | "overwrite";
  preserved?: string[];
  updated?: string[];
}

export type BrokerImportMode = "insert" | "smart-merge" | "overwrite";

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

// Considered "empty" for smart-merge purposes
const isEmpty = (v: any) =>
  v === null ||
  v === undefined ||
  v === "" ||
  v === 0 ||
  (Array.isArray(v) && v.length === 0) ||
  (typeof v === "object" && !Array.isArray(v) && v !== null && Object.keys(v).length === 0);

// Top-level broker columns that smart-merge will preserve when already set
const BROKER_PROTECTED_FIELDS = [
  "score", "stars", "regulation", "avg_spread", "leverage", "min_deposit",
  "pros", "cons", "payment_methods", "platforms", "account_types",
  "payment_method_details", "withdrawal_time", "withdrawal_fee",
  "support_email", "support_phone", "description", "headquarters",
  "founded_year", "tags", "promo_label", "promo_code", "affiliate_url",
  "warning_note", "license_number", "logo_url",
];

// In overwrite mode, these fields are CLEARED (set to null/empty) when omitted
// from the incoming payload. Prevents stale promo codes / warnings persisting
// across re-imports when the new JSON no longer carries them.
const BROKER_CLEARABLE_ON_OVERWRITE = [
  "promo_code", "promo_label", "affiliate_url", "warning_note",
];

// v4.7/v4.8 master-prompt spec puts these INSIDE long_review, but AI agents
// often emit them at the top level. Move them in so the data is preserved
// and BrokerDetail.tsx (which reads broker.long_review.regulatory_risk_warning etc.)
// can render them. Does not overwrite values already present inside long_review.
const LONG_REVIEW_SIDECAR_KEYS = [
  "author", "conflict_note", "regulatory_risk_warning", "target_locale",
  "toc", "social_snippet", "comparison_block", "video_embed", "assets",
  "last_human_review_at", "image_assets", "all_in_cost", "schema_jsonld",
];

export function nestSidecarsIntoLongReview(raw: Record<string, any>): Record<string, any> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return raw;
  const out: Record<string, any> = { ...raw };
  const lr: Record<string, any> = (out.long_review && typeof out.long_review === "object" && !Array.isArray(out.long_review))
    ? { ...out.long_review }
    : {};
  let touched = false;
  for (const key of LONG_REVIEW_SIDECAR_KEYS) {
    if (key in out) {
      const val = out[key];
      const hasValue = val !== undefined && val !== null && val !== "";
      if (hasValue) {
        const lrEmpty = !(key in lr) || lr[key] === undefined || lr[key] === null || lr[key] === "";
        if (lrEmpty) lr[key] = val;
      }
      // Always strip sidecar key from top level so it never shows as "Unknown field"
      delete out[key];
      touched = true;
    }
  }
  if (touched || out.long_review) out.long_review = lr;
  return out;
}


/**
 * Insert (or smart-merge / overwrite) a validated payload into the entity's target table.
 * - "insert": always insert as draft (legacy behaviour).
 * - "smart-merge" (brokers only): if a broker with the same slug exists, update — long_review is fully
 *   replaced, top-level fields are only overwritten when the existing value is empty.
 * - "overwrite" (brokers only): update existing row by slug, overwriting every provided field.
 */
export async function importEntity(
  entity: EntityDefinition,
  cleaned: Record<string, any>,
  userId: string | null,
  mode: BrokerImportMode = "insert",
  autoPublish: boolean = false
): Promise<ImportResult> {
  const table = entity.table;
  const payload: Record<string, any> = { ...cleaned };

  if ("slug" in entity.schema.fields && !payload.slug) {
    const base = payload.name || payload.title || "";
    if (base) payload.slug = slugify(base);
  }

  const draftableTables = new Set(["brokers", "promotions", "news_articles", "calendar_events", "forecasts", "scam_alerts"]);
  const trackedTables = new Set(["brokers", "promotions", "news_articles", "calendar_events", "forecasts"]);

  // For brokers, if a row with the same slug exists, update instead of failing on duplicate.
  // insert mode auto-upgrades to overwrite on conflict so re-imports always work.
  if (table === "brokers" && payload.slug) {
    const { data: existing } = await (supabase as any)
      .from("brokers")
      .select("*")
      .eq("slug", payload.slug)
      .maybeSingle();

    if (existing) {
      const effectiveMode: BrokerImportMode = mode === "smart-merge" ? "smart-merge" : "overwrite";
      const updated: string[] = [];
      const preserved: string[] = [];
      const updatePayload: Record<string, any> = {};

      if ("long_review" in payload) {
        updatePayload.long_review = payload.long_review;
        updated.push("long_review");
      }

      for (const [key, val] of Object.entries(payload)) {
        if (key === "long_review" || key === "id" || key === "slug" || key === "created_at" || key === "created_by") continue;
        if (effectiveMode === "overwrite") {
          updatePayload[key] = val;
          updated.push(key);
          continue;
        }
        if (BROKER_PROTECTED_FIELDS.includes(key) && !isEmpty(existing[key])) {
          preserved.push(key);
          continue;
        }
        if (!isEmpty(val)) {
          updatePayload[key] = val;
          updated.push(key);
        }
      }

      if (autoPublish) updatePayload.status = "published";
      updatePayload.updated_at = new Date().toISOString();

      // In overwrite mode, clear stale promo/warning fields if the new payload omits them
      if (effectiveMode === "overwrite") {
        for (const key of BROKER_CLEARABLE_ON_OVERWRITE) {
          if (!(key in payload)) {
            updatePayload[key] = null;
            updated.push(`${key} (cleared)`);
          }
        }
      }

      const { error } = await (supabase as any)
        .from("brokers")
        .update(updatePayload)
        .eq("id", existing.id);
      if (error) return { success: false, error: error.message, mode: effectiveMode };
      return { success: true, id: existing.id, mode: effectiveMode, preserved, updated };
    }
  }

  if (draftableTables.has(table)) payload.status = payload.status || (autoPublish ? "published" : "draft");
  if (autoPublish && draftableTables.has(table)) payload.status = "published";
  if (trackedTables.has(table) && userId) payload.created_by = userId;

  const { data, error } = await (supabase as any).from(table).insert(payload).select("id").single();
  if (error) return { success: false, error: error.message, mode: "insert" };
  return { success: true, id: data?.id, mode: "insert", updated: Object.keys(payload) };
}
