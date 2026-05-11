## Problem

Footer code e "How We Review" link ache (Company column e), kintu actual footer rendered hocche `site_settings` table er `footer` key theke. Database er saved footer config e "How We Review" link nei, tai user dekhte pacche na.

## Fix

Ekta migration cholabo ja `site_settings` row (key = `footer`) er JSON `value.columns` array er moddhe "Company" titled column khujbe ar "Partnership" entry er thik pore "How We Review" → `/how-we-review` entry insert korbe (already thaklename idempotent — duplicate add hobe na).

## Technical

- Table: `public.site_settings`, row: `key = 'footer'`, JSONB column: `value`
- SQL: `jsonb_set` diye `columns` array er Company object er `links` array update kora; check kore jodi already "How We Review" thake to skip.
- No code/file change. Frontend automatic refresh hobe (useSiteSettings hook).

## Out of scope

- Footer code (already correct)
- Onno kono column / link
