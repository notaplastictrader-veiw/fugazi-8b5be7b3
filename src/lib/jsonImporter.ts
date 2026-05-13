import { supabase } from "@/integrations/supabase/client";
import type { EntityDefinition } from "./researchPrompts";

export interface ImportResult {
  success: boolean;
  id?: string;
  error?: string;
}

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

/**
 * Insert a validated payload into the entity's target Supabase table.
 * Always inserts as `status='draft'` (where supported) and stamps `created_by`.
 */
export async function importEntity(
  entity: EntityDefinition,
  cleaned: Record<string, any>,
  userId: string | null
): Promise<ImportResult> {
  const table = entity.table;
  const payload: Record<string, any> = { ...cleaned };

  // Default slug from name/title if missing
  if ("slug" in entity.schema.fields && !payload.slug) {
    const base = payload.name || payload.title || "";
    if (base) payload.slug = slugify(base);
  }

  // Force draft on tables that support `status`
  const draftableTables = new Set([
    "brokers", "promotions", "news_articles", "calendar_events", "forecasts", "scam_alerts",
  ]);
  if (draftableTables.has(table)) payload.status = payload.status || "draft";

  // Stamp creator on tables that have created_by
  const trackedTables = new Set([
    "brokers", "promotions", "news_articles", "calendar_events", "forecasts",
  ]);
  if (trackedTables.has(table) && userId) payload.created_by = userId;

  const { data, error } = await (supabase as any).from(table).insert(payload).select("id").single();
  if (error) return { success: false, error: error.message };
  return { success: true, id: data?.id };
}
