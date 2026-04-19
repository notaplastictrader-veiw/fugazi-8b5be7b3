

## Adjusting the plan

User wants the full system but **no prices shown publicly**. Cards display placement options only — interested brands fill the form, admin contacts them with media kit + pricing.

## Updated plan

### 1. Database — 2 new tables

**`ad_placements`** (admin-managed catalog, no public pricing)
- `id`, `slug`, `title`, `description`, `icon` (lucide name), `internal_price_note` (text, admin-only — for admin's own reference), `display_order`, `is_active`, `created_at`, `updated_at`
- Seeded with the 6 existing placements
- RLS: public SELECT where `is_active=true` (only non-sensitive columns matter publicly); admin full access

**`ad_enquiries`** (form submissions)
- `id`, `name`, `email`, `company`, `company_url`, `company_age`, `message`, `placement_slug` (nullable), `status` (`new` / `contacted` / `media_kit_sent` / `negotiating` / `won` / `lost`), `admin_notes`, `assigned_to`, `created_at`, `updated_at`
- RLS: public INSERT; admin SELECT/UPDATE only

### 2. CMS row — `site_settings.advertise_page`
Editable copy: eyebrow tag, title, accent text, subtitle, form heading, form subtitle, success toast (e.g. "Enquiry received! We'll share our media kit within 24 hours.").

### 3. Frontend — `src/pages/Advertise.tsx`
- Fetch placements from DB (fallback to current 6 if empty)
- **No price displayed** on cards — just icon, title, description (matches current look)
- Clicking a card scrolls to form & pre-selects `placement_slug` (hidden field, shown as a small "Interested in: Homepage Banner" badge above the form)
- Form submits to `ad_enquiries` (real insert, replacing fake setTimeout)
- Notify admins via `notifyAdmins.ts` on new enquiry
- Pull copy from `useSiteSettings("advertise_page", {...})`

### 4. Admin panel — 2 new pages
- **`/admin/advertise/placements`** — CRUD placements (title, description, icon, internal price note, order, active toggle)
- **`/admin/advertise/enquiries`** — table of submissions with status workflow, assign-to, admin notes, CSV export, status filter, mark "Media Kit Sent" action
- New "Advertise" group in `AdminSidebar.tsx`
- Permission: Super Admin only (matches sensitive sales data)

### 5. Seed data
The 6 current placements with empty `internal_price_note` (admin fills in later via admin panel).

### Files touched
- New migration: 2 tables + RLS + seeds + `site_settings` row
- `src/pages/Advertise.tsx` — wire to DB, CMS copy, real submit, no prices
- `src/pages/admin/AdvertisePlacementsAdmin.tsx` — new
- `src/pages/admin/AdvertiseEnquiriesAdmin.tsx` — new
- `src/components/admin/AdminSidebar.tsx` — add nav group
- `src/App.tsx` — register 2 admin routes

### Out of scope
- Public pricing display (intentionally hidden — sales-driven flow)
- Stripe/payments
- Auto-email media kit (admin sends manually for now; can add edge function later)

