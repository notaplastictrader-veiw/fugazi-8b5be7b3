# Fix remaining nested long_review brokers

## Status check (just ran)
- Total brokers: 905
- With `long_review` content: 23
- Properly shaped (verdict + sections at top level): 20 ✅
- **Still nested (broken Full Review tab): 3** ❌
  - `bdswiss`
  - `blackbull-markets`
  - `centfx`

The other 882 brokers simply have no `long_review` yet — that's expected (only the ones you've imported so far have content).

## Fix
Run the same flatten UPDATE used previously, scoped to the 3 remaining slugs:

```sql
UPDATE public.brokers
SET long_review = (long_review - 'long_review') || (long_review->'long_review')
WHERE slug IN ('bdswiss','blackbull-markets','centfx')
  AND long_review ? 'long_review';
```

Then re-verify all 23 show `has_verdict=true`, `has_sections=true`, `still_nested=false`.

No code changes needed — importer was already patched to auto-flatten future uploads.
