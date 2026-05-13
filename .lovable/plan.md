
# Plan: Exness Update + Research Prompt Library

Two-phase delivery. Phase A finishes in one step; Phase B is the reusable system.

---

## PHASE A — Exness Data Update (immediate, ~5 min)

Update the existing `brokers` row for Exness using verified fields from the DeepSeek report.

**Fields to update on `brokers` (slug = `exness`):**
- `score`: 8.1
- `stars`: 4.3
- `founded_year`: 2008
- `headquarters`: "Limassol, Cyprus"
- `website_url`: "https://www.exness.com"
- `description`: 2–3 sentence summary from report
- `regulation`: ["FCA (UK) — 730729", "CySEC (Cyprus) — 178/12", "FSCA (South Africa)", "FSA (Seychelles)", "CBCS (Curaçao)", "CMA (Kenya)", "FSC (BVI)"]
- `min_deposit`: "$10"
- `leverage`: "Unlimited (Pro), 1:2000 (Standard)"
- `avg_spread`: "0.3 pips (Standard), 0.0 pips (Raw/Zero)"
- `account_types`: JSON array — Standard, Standard Cent, Pro, Raw Spread, Zero
- `platforms`: ["MT4", "MT5", "Exness Terminal", "Exness Mobile"]
- `payment_methods`: ["Visa", "Mastercard", "Skrill", "Neteller", "Perfect Money", "Crypto", "Local bank transfer"]
- `pros`: 4–6 bullets from report
- `cons`: 3–4 bullets from report
- `support_email`, `support_phone`
- `withdrawal_time`: "Instant for most methods"
- `tags`: ["forex", "crypto", "low-spread", "bd-friendly", "instant-withdrawal"]
- `badge`: "verified"
- `status`: "published"
- `last_verified_at`: now()

Tool: single `supabase--insert` UPDATE statement.

---

## PHASE B — Research Prompt Library + JSON Importer

### B1. Files to create

```
src/lib/researchPrompts.ts        — Prompt + JSON schema for each entity type
src/lib/jsonValidator.ts          — Validate parsed JSON against schema
src/lib/jsonImporter.ts           — Map validated JSON → correct Supabase table insert
src/components/admin/PromptCard.tsx        — Reusable card: title, prompt textarea, copy button, schema reference
src/components/admin/JsonPreviewCard.tsx   — Live preview of parsed JSON as it will appear
src/pages/admin/ResearchPromptsAdmin.tsx   — Tabbed page with all entity prompts
src/pages/admin/ImportJsonAdmin.tsx        — Paste JSON → preview → insert as draft
```

### B2. Entity coverage (Phase B scope = all 10)

For each entity: a strict JSON-only research prompt + matching schema + insert mapper.

1. **Broker** → `brokers` table
2. **Prop Firm** → `brokers` table (type=`prop`)
3. **Sportsbook / Betting Site** → `betting_sites` table
4. **Signal Group** → existing signals admin table
5. **Scam Alert** → `scam_alerts` table
6. **Promotion** → `promotions` table
7. **Regulator** → static `regulators.ts` (or new table if user prefers)
8. **Education Article** → `education_articles` table
9. **Forex News** → `news_articles` table
10. **Calendar Event** → `calendar_events` table

### B3. Prompt design rules (applied to every prompt)

- Output format: **strict JSON only**, no markdown, no commentary
- Required: cite source URL for every license/claim
- Forbidden: guessing — unverifiable fields must be `null`
- Schema enums enforced (e.g. `type: forex|crypto|prop|binary`)
- Includes example output for the agent

### B4. Importer page flow

1. Select entity type (dropdown)
2. Paste JSON in textarea
3. Click **Preview** → runs `jsonValidator`
4. Show validation result:
   - 🟢 Valid → preview card + "Insert as Draft" button
   - 🔴 Errors → list missing/invalid fields, allow inline fix
5. On Insert → calls correct Supabase insert with `status='draft'`, `created_by=auth.uid()`
6. Toast confirmation + link to the new record's admin edit page

### B5. Sidebar wiring

Add to `AdminSidebar.tsx` under OVERVIEW or new "TOOLS" section (super_admin only):
- Research Prompts → `/admin/research-prompts`
- Import JSON → `/admin/import-json`

### B6. Routes wiring

Register both routes in `src/App.tsx` inside `<ProtectedAdminRoute>`.

---

## Technical notes

- No new tables needed — uses existing tables.
- No edge functions needed — pure client-side parse + insert via Supabase JS.
- Validation is plain TS (no zod added) — keeps bundle small. Each schema is an object describing required keys + types.
- Bulk import (JSON array) supported in same Importer page from day 1 — same code path, just iterate.
- Future Phase 3 (auto-call agent API) is non-blocking; current architecture supports it.

---

## Delivery order

1. Run Phase A (Exness UPDATE) — 1 migration tool call (insert tool)
2. Confirm Exness page looks correct on `/brokers/exness`
3. Build Phase B files in one batch
4. Test: paste a sample broker JSON → verify preview + insert flow
5. Done.

Total estimated build: A = 1 step, B = ~8 file writes + 1 sidebar edit + 1 route edit.
