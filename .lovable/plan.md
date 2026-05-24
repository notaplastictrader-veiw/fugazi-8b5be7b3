# Fix v4.8 import: auto-nest sidecar fields into `long_review`

## Asol problem (jeta age bujhi nai)

Ei "Unknown field" warning gulo asholei amader UI te **already supported**. Master prompt v4.7/v4.8 spec onujayi `author`, `conflict_note`, `regulatory_risk_warning`, `toc`, `social_snippet`, `comparison_block`, `video_embed`, `assets`, `target_locale` — egulo shob `long_review` jsonb er **bhitore** thakar kotha. BrokerDetail.tsx ekhonoi `broker.long_review?.regulatory_risk_warning` etc render kore.

Kintu AI agent (Exness JSON e dekhlam) egulo **top-level** e bashate diyeche. Tai validator "unknown field" bole strip kore dey ar data harie jay.

Tai column add korar dorkar nai. Just importer ke smart banai.

## Ki bodlabo

### 1. `src/lib/researchPrompts.ts` — chhoto fix
- Broker schema `fields` e `logo_url: { type: "string" }` add koro. Eta brokers table e real column kintu schema te missing chilo (bug).

### 2. `src/lib/jsonImporter.ts` — auto-nest pre-processor
- Ekta helper banao: `nestSidecarsIntoLongReview(raw)`.
- Ei whitelist field gulo top-level e thakle `long_review` er bhitore move kore dey:
  - `author`, `conflict_note`, `regulatory_risk_warning`, `target_locale`
  - `toc`, `social_snippet`, `comparison_block`, `video_embed`, `assets`
  - `last_human_review_at`, `image_assets`, `all_in_cost`, `schema_jsonld`
- `long_review` na thakle banai dey. Already inside thakle override koro na.
- `importEntity()` start e brokers er jonno apply koro.

### 3. `src/pages/admin/ImportJsonAdmin.tsx` — preview o same logic
- `runPreview()` e validate korar age same nesting apply koro, jate warning na ase ar user dekhte pay field gulo `long_review` te ja66e.

## Ja change hocche na
- Database schema (no migration)
- BrokerDetail.tsx (render already kaaj korche)
- Existing brokers (untouched until re-imported)

## Result
- Exness import korle: 11 warning theke ~0-1 te nambe
- `regulatory_risk_warning` amber banner page top e show korbe
- `conflict_note`, `author`, `toc` etc `long_review` te properly store hobe, future UI work er jonno ready
- Future v4.8 import o seamless
