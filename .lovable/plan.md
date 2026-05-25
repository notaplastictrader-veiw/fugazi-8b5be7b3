# Plan

## What’s happening
The FTMO row still has `promo_code = NAFTFTMO`, `promo_label = 10% off $100K 1-Step Challenge`, and the affiliate URL in the database. That means the import did update the broker, but those promo fields were preserved because the importer currently protects existing broker fields during re-import when the incoming JSON does not explicitly replace them.

## What I’ll change
1. Review the broker import logic that decides which fields are preserved vs overwritten.
2. Update the importer so broker re-imports can clear or replace promo-related fields when the new JSON omits them, instead of silently keeping old values.
3. Verify the FTMO data flow so future imports behave predictably for omitted fields, especially `promo_code`, `promo_label`, and `affiliate_url`.

## Expected result
- If your FTMO JSON does not contain those promo values, they will no longer stay around by accident after re-import.
- Existing re-import behavior for the rest of the broker content will remain intact unless the field-clearing rule needs to apply there too.

## Technical details
- Main file likely involved: `src/lib/jsonImporter.ts`
- Current behavior comes from the protected-field smart merge / overwrite logic for brokers.
- I’ll keep this limited to importer behavior, not schema changes.