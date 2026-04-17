

## Goal
Content Management menu-র **প্রতিটা tab** (Brokers, Betting Sites, Signal Groups, Forecasts, Promotions, News, Calendar, Sports, Education, Courses, Scam Alerts) — সব frontend page-এ যা যা field দেখা যায় সব admin থেকে add/edit/remove করা যাবে।

## Investigation Summary

বর্তমান অবস্থা প্রতিটা admin tab-এর:

| Tab | Status | Missing |
|-----|--------|---------|
| Brokers | ✅ Working (CRUD) | Some frontend fields hardcoded (description, pros/cons, payment methods, platforms) |
| Betting Sites | ⚠️ Read-only list | Full CRUD modal missing — frontend uses static `bettingSites.ts` |
| Signal Groups | ✅ Working | Telegram link, description, pricing tiers missing from DB |
| Forecasts | ✅ Working | OK |
| Promotions | ✅ Working | OK |
| News | ✅ Working | OK |
| Calendar | ✅ Working | OK |
| Sports | ✅ Working | OK |
| **Education** | ❌ **Disabled buttons** | No DB table, fully hardcoded |
| **Courses** | ❌ **Likely missing/disabled** | No DB table |
| Scam Alerts | ✅ Working | OK |

## Plan

### Phase 1: Education + Courses (CRITICAL — fully broken)
**New tables:**
- `education_articles` — id, title, slug, track, read_time, is_locked, course_id, sections (jsonb), key_takeaway, display_order, status, timestamps
- `courses` — id, title, slug, type, price, original_price, description, includes (text[]), note, is_active, is_featured, display_order, timestamps
- RLS: public SELECT on published; super_admin full access
- Seed with existing `educationArticles.ts` + `coursesData.ts`

**Admin rewrites:**
- `EducationAdmin.tsx` → full CRUD modal (title, slug auto-gen, track dropdown, read_time, is_locked toggle, course_id link, **nested sections editor** for add/remove/reorder content blocks, key_takeaway)
- New `CoursesAdmin.tsx` → CRUD modal (title, slug, type [course/ebook/bundle], price, original_price, description, includes list, note, switches)
- Add `/admin/courses` route + sidebar link

**Frontend wiring:**
- `Education.tsx` → fetch from DB with static fallback
- `EducationArticle.tsx` → fetch by slug from DB

### Phase 2: Betting Sites (read-only → full CRUD)
**Migration:** New `betting_sites` table — id, name, slug, logo, rating, bonus, sports (text[]), features (text[]), min_deposit, withdrawal_speed, license, url, warning, status, display_order. Seed from `bettingSites.ts`.

**Admin:** Rewrite `BettingSitesAdmin.tsx` with CRUD modal for all fields (sports/features as multi-select tag input).

**Frontend:** `Sports.tsx` fetches from DB with static fallback.

### Phase 3: Brokers — Add Missing Fields
**Migration:** Add columns to `brokers` table:
- `description` (text), `founded_year` (int), `headquarters` (text)
- `pros` (text[]), `cons` (text[])
- `payment_methods` (text[]), `platforms` (text[])
- `account_types` (jsonb — array of `{name, min_deposit, spread, commission}`)
- `website_url`, `support_email`, `support_phone`

**Admin:** Extend `BrokersAdmin.tsx` modal with new fields (multi-line list inputs + nested account_types editor).

**Frontend:** `BrokerDetail.tsx` displays all new fields.

### Phase 4: Signal Groups — Add Missing Fields  
**Migration:** Add columns to `signal_groups`:
- `description` (text), `telegram_url` (text), `discord_url` (text)
- `pricing_tiers` (jsonb — array of `{name, price, period, features[]}`)
- `sample_signals` (jsonb), `categories` (text[])

**Admin:** Extend `SignalsAdmin.tsx` modal.

**Frontend:** `SignalGroupDetail.tsx` displays all new fields.

## Files Changed (~18)
- 4 new migrations (education+courses tables, betting_sites table, brokers extra cols, signal_groups extra cols)
- 4 admin rewrites/extensions: `EducationAdmin.tsx`, `CoursesAdmin.tsx` (NEW), `BettingSitesAdmin.tsx`, `BrokersAdmin.tsx`, `SignalsAdmin.tsx`
- 1 sidebar update: `AdminSidebar.tsx` (add Courses link if missing)
- 1 routes update: `App.tsx`
- Frontend updates: `Education.tsx`, `EducationArticle.tsx`, `Sports.tsx`, `BrokerDetail.tsx`, `SignalGroupDetail.tsx`

## Out of Scope
- Image upload to Supabase Storage (will use URL inputs for now)
- Rich text WYSIWYG editor (textareas with markdown support)
- Course payment integration

## Approach
Phase 1 → 2 → 3 → 4, sequentially. Each phase is independently testable. All changes keep static fallbacks so site never breaks if DB empty.

