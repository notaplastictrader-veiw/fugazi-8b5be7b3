import type { EntitySchema, FieldSchema } from "./researchPrompts";

export interface ValidationIssue {
  field: string;
  message: string;
  severity: "error" | "warning";
}

export interface ValidationResult {
  valid: boolean;
  issues: ValidationIssue[];
  cleaned: Record<string, any>;
}

const isUrl = (v: any) => typeof v === "string" && /^https?:\/\/\S+/i.test(v);
const isIsoDate = (v: any) => typeof v === "string" && /^\d{4}-\d{2}-\d{2}/.test(v);

const validateField = (key: string, value: any, schema: FieldSchema): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  if (value === null || value === undefined || value === "") {
    if (schema.required) issues.push({ field: key, message: "Required field is missing", severity: "error" });
    return issues;
  }

  switch (schema.type) {
    case "string":
      if (typeof value !== "string") issues.push({ field: key, message: `Expected string, got ${typeof value}`, severity: "error" });
      break;
    case "number":
      if (typeof value !== "number" || Number.isNaN(value)) {
        issues.push({ field: key, message: `Expected number, got ${typeof value}`, severity: "error" });
      } else {
        if (schema.min !== undefined && value < schema.min) issues.push({ field: key, message: `Value ${value} below min ${schema.min}`, severity: "error" });
        if (schema.max !== undefined && value > schema.max) issues.push({ field: key, message: `Value ${value} above max ${schema.max}`, severity: "error" });
      }
      break;
    case "boolean":
      if (typeof value !== "boolean") issues.push({ field: key, message: "Expected boolean", severity: "error" });
      break;
    case "array":
      if (!Array.isArray(value)) issues.push({ field: key, message: "Expected array", severity: "error" });
      break;
    case "object":
      if (typeof value !== "object" || Array.isArray(value)) issues.push({ field: key, message: "Expected object", severity: "error" });
      break;
    case "url":
      if (!isUrl(value)) issues.push({ field: key, message: "Invalid URL", severity: "warning" });
      break;
    case "date":
      if (!isIsoDate(value)) issues.push({ field: key, message: "Invalid date (use YYYY-MM-DD)", severity: "error" });
      break;
  }

  if (schema.enum && typeof value === "string" && !schema.enum.includes(value)) {
    issues.push({ field: key, message: `Must be one of: ${schema.enum.join(", ")}`, severity: "error" });
  }

  return issues;
};

export function validate(input: any, schema: EntitySchema): ValidationResult {
  const issues: ValidationIssue[] = [];
  const cleaned: Record<string, any> = {};

  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return { valid: false, issues: [{ field: "_root", message: "Expected JSON object", severity: "error" }], cleaned: {} };
  }

  // Validate each known field
  for (const [key, fieldSchema] of Object.entries(schema.fields)) {
    const v = input[key];
    const fieldIssues = validateField(key, v, fieldSchema);
    issues.push(...fieldIssues);
    if (v !== undefined && v !== null && v !== "") {
      cleaned[key] = v;
    }
  }

  // Strip reserved + unknown fields, but warn
  const allowed = new Set(Object.keys(schema.fields));
  const reserved = new Set(schema.reserved || []);
  for (const key of Object.keys(input)) {
    if (key === "sources" || key === "insufficient_evidence" || key === "reason") continue;
    if (reserved.has(key)) {
      issues.push({ field: key, message: "Reserved field — will be ignored", severity: "warning" });
      continue;
    }
    if (!allowed.has(key)) {
      issues.push({ field: key, message: "Unknown field — will be ignored", severity: "warning" });
    }
  }

  const hasError = issues.some((i) => i.severity === "error");
  return { valid: !hasError, issues, cleaned };
}

export function tryParseJson(raw: string): { ok: true; data: any } | { ok: false; error: string } {
  const trimmed = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "");
  try {
    return { ok: true, data: JSON.parse(trimmed) };
  } catch (e: any) {
    // Try parsing as multiple concatenated JSON values
    // (e.g. v4.8 broker_payload + editorial_review_row sidecar pasted together)
    try {
      const results: any[] = [];
      let i = 0;
      const s = trimmed;
      while (i < s.length) {
        while (i < s.length && /\s/.test(s[i])) i++;
        if (i >= s.length) break;
        const openCh = s[i];
        if (openCh !== "{" && openCh !== "[") throw e;
        let depth = 0;
        let inStr = false;
        let esc = false;
        const start = i;
        for (; i < s.length; i++) {
          const c = s[i];
          if (inStr) {
            if (esc) esc = false;
            else if (c === "\\") esc = true;
            else if (c === '"') inStr = false;
            continue;
          }
          if (c === '"') { inStr = true; continue; }
          if (c === "{" || c === "[") depth++;
          else if (c === "}" || c === "]") {
            depth--;
            if (depth === 0) { i++; break; }
          }
        }
        results.push(JSON.parse(s.slice(start, i)));
      }
      if (results.length >= 1) {
        return { ok: true, data: results.length === 1 ? results[0] : results };
      }
      throw e;
    } catch {
      return { ok: false, error: e?.message || "Invalid JSON" };
    }
  }
}
