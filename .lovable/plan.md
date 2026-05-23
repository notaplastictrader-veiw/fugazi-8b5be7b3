## Problem

Full Review tab is blank because the broker's content fields (`verdict`, `sections`, `faq`, `at_a_glance`, `hot_take`, `trustpilot`, `word_count`, `reading_time_minutes`, `sources`, `disclaimer`, etc.) live **one level too deep** in the DB.

Current DB shape for `brokers.long_review`:
```
{
  toc: [...],            // ✅ top level — sidebar renders
  author: {...},
  editorial_review_row: {...},
  long_review: {         // ❌ everything the page needs is nested here
    verdict, sections, faq, at_a_glance, hot_take,
    trustpilot, word_count, reading_time_minutes,
    sources, disclaimer, schema_jsonld, ...
  }
}
```

`LongReview.tsx` reads from `data.verdict`, `data.sections`, etc. — none exist at the top, so almost nothing renders.

Root cause: the source JSON wrapped the body under a key literally named `long_review`. The importer treated it as just another "extra" and merged it as-is, producing the nested structure.

## Fix

### 1. Flatten the 2 already-imported brokers
Update both `cmc-markets` and `cxm-trading` rows: merge `long_review->'long_review'` into `long_review` and drop the inner key.

SQL (data update):
```sql
UPDATE public.brokers
SET long_review = (long_review - 'long_review') || (long_review->'long_review')
WHERE slug IN ('cmc-markets','cxm-trading')
  AND long_review ? 'long_review';
```

### 2. Patch the importer
In `/tmp/import_broker.mjs`, when building `extras`, if `extras.long_review` exists, spread it into `extras` and delete the wrapper key. This prevents future double-nesting for any uploaded JSON that follows the same shape.

## Result

Full Review tab renders verdict card, all section blocks, TOC anchors, FAQ, and footer chips (reading time, word count, Trustpilot pill) as designed.