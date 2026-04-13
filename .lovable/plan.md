

# NAPT — 7 Changes Implementation Plan

This is one of the largest feature requests to date. It involves new database tables, new pages, new admin panels, rich text editing, and a social/community system. Below is the phased plan.

---

## Scope Assessment

| Change | Complexity | New Files | New DB Tables | Priority |
|--------|-----------|-----------|---------------|----------|
| 1. Sports + Betting Sites | High | ~5 | 1 (betting_sites) | 5 |
| 2. Education Full Rebuild | Very High | ~8 | 2 (education_articles, courses) | 1 |
| 3. Promotions Upgrade | Medium | ~3 | 1 (promotions_detail) | 4 |
| 4. Calendar | None | 0 | 0 | — |
| 5. News | None | 0 | 0 | — |
| 6. Full Review Pages | Very High | ~6 | 0 (extends brokers) | 2 |
| 7. Trading Ideas Rebuild | Very High | ~8 | 3 (trading_ideas, idea_reactions, idea_comments, private_submissions) | 3 |

**Total estimated: ~30+ new/modified files, 7 new database tables, 6 migrations.**

---

## IMPORTANT: This must be built in multiple rounds

This plan covers ALL 7 changes but they cannot all be implemented in a single response. I recommend building them in this order across multiple rounds:

---

## PHASE 1 — Education Hub (Change 2)

### Database migrations:
- `education_articles` table: id, title, slug, track, body_html, read_time_minutes, is_locked, course_id, is_published, author, created_at, updated_at
- `courses` table: id, title, type (course/ebook/bundle), price, description, includes_text, is_active, is_featured, slug, created_at

### Frontend:
- **New page: `/education/:slug`** — Full article page with breadcrumb, TOC sidebar, read time, sections, Key Takeaway box, Next Article link
- **Update `/education`** — Make lesson items clickable (Link to `/education/:slug`), locked items redirect to course section or show tooltip
- **New section on Education page** — "Take Your Trading Further" courses grid (6 course cards with Buy Now buttons)
- **Purchase modal component** — Crypto payment flow (copy wallet, Telegram link, email instructions)
- **Write all 15 article contents** as seed data (HTML content for each lesson)

### Admin:
- Education Articles admin page (CRUD, rich text with track selector, publish toggle)
- Courses admin page (CRUD, price, type, active toggle)
- New admin routes + sidebar entries

---

## PHASE 2 — Full Review Page Template (Change 6)

### Database:
- Add `full_review_html` column to `brokers` table (text, nullable)
- Add `meta_title`, `meta_description` columns to `brokers`

### Frontend:
- **Rebuild `BrokerDetail.tsx`** with tabbed layout: Overview | Reviews | Complaints | Promotions | Comparison | Scam Score
- Overview tab renders the rich HTML review content from `full_review_html`
- Reviews tab shows existing community reviews
- Header redesign: logo + name + score bar + badges + regulation + "Open Account" CTA
- Same template reusable for prop firms, betting sites, signal providers (via entity type prop)

### Admin:
- Add "Full Review" tab in broker edit with rich text editor (TipTap)
- Section-based content builder with drag-to-reorder
- SEO fields, preview button

---

## PHASE 3 — Trading Ideas / Share Ideas Rebuild (Change 7)

### Database migrations:
- `trading_ideas`: id, user_id, asset, direction, title, body, chart_image_url, timeframe, risk_level, created_at, is_hidden, is_pinned, is_featured
- `idea_reactions`: id, idea_id, user_id, reaction_type, created_at (unique on idea_id + user_id)
- `idea_comments`: id, idea_id, user_id, parent_comment_id, body, created_at, is_hidden
- `private_submissions`: id, user_id, category, title, body, status, admin_note, created_at

### Frontend:
- **Rebuild `/ideas`** as Trading Ideas community page
- Two-column layout: scrollable feed (left) + quick post + top contributors (right)
- Trading idea cards with reactions (🔥👍👎💡⚠️), inline comments
- Feed container: ~600px height, scrollable, sorting tabs (Trending/Latest/Most Reactions/Most Discussed)
- Asset filter pills
- Post modal: asset selector, direction toggle, title, analysis textarea, chart upload, timeframe, risk level, disclaimer checkbox
- Private submission form for Bug/Feature/Content (goes to admin only)

### Admin:
- Trading Ideas moderation panel (hide/pin/feature)
- Private Submissions table with status management

---

## PHASE 4 — Promotions Upgrade (Change 3)

### Database:
- `promotions_detail`: id (FK to promotions), full_description, how_to_claim, terms_json, expiry_date, is_featured_in_ticker, slug

### Frontend:
- Add filter tabs: All | Deposit Bonus | No Deposit | Cashback | Challenge Discount | Free Trial
- Add "Read More →" and "Claim Offer →" buttons to each card
- **New page: `/promotions/:slug`** — Full promotion detail with terms, steps, countdown timer, sticky CTA on mobile
- "View all promotions →" link in homepage promotions section

### Admin:
- Extended promotions editor with full description, terms, how-to-claim, featured toggle

---

## PHASE 5 — Sports + Betting Sites (Change 1)

### Database:
- `betting_sites`: id, name, slug, logo_url, license_info, supported_sports, affiliate_url, scam_score, rating, review_count, is_verified, is_featured, is_active, created_at

### Frontend:
- Add "Betting Sites" filter to Sports page
- When active: show betting site card grid (same style as broker cards)
- Add "Potential" row + mandatory risk warning to every prediction card
- Betting site cards: logo, name, badge, supported sports, license, scam score, star rating, Visit Site + Read Reviews buttons

### Admin:
- Betting Sites CRUD admin page

---

## Changes 4 & 5 — Calendar & News
Leave as-is. No changes.

---

## Technical Notes

- **Rich text editor**: Will use TipTap (free, React-native, excellent for WYSIWYG). Added as npm dependency.
- **Image uploads**: Chart images in trading ideas will use Supabase Storage bucket (no Cloudinary needed — keeps stack simpler).
- **No payment gateway**: Course purchases use the manual crypto/Telegram/email flow as specified.
- **RLS policies**: All new tables get proper RLS — public read for published content, authenticated write for user-generated content, admin-only for moderation.
- **Types regeneration**: After each migration, Supabase types will need regeneration.

---

## Shall I start with Phase 1 (Education Hub)?

