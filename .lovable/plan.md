

# Plan: 4 Tasks — Compare Bug Fix, BrokerDetail Rebuild, Supabase Migrations, Sports Console Check

## Task 1: Fix Compare Page — 2nd Broker Selection Bug

**Problem**: When adding a 2nd broker, `setSearchParams` triggers a component re-render. The `Select` component doesn't reset after selection, and the URL update may cause state desync.

**Fix**:
- Add a `key` prop to `Select` that changes on each selection (e.g., `key={selected.length}`) to force reset after each broker is added
- Ensure `updateUrl` doesn't trigger unnecessary re-renders by checking if params actually changed
- File: `src/pages/Compare.tsx`

## Task 2: BrokerDetail Page — Already Has Tabbed Layout

The BrokerDetail page already has a full tabbed layout with **Overview, Reviews, Complaints, and Scam Score** tabs (545 lines). The existing tabs cover:
- Overview: Verdict, Key Facts, Regulation, Trading Conditions, Platforms, Deposits, Support, Pros/Cons, Best For, Final Verdict, How to Open Account
- Reviews: Community reviews with submission form
- Complaints: Complaint count with file complaint CTA
- Scam Score: Rating bars and methodology

**Enhancement** — Add 2 missing tabs:
- **Promotions tab**: Show active promotions for this broker (from `promotions` table where `broker_id` matches)
- **Comparison tab**: Quick compare link to `/compare?b=<slug>` with "Add another broker to compare" CTA

File: `src/pages/BrokerDetail.tsx`

## Task 3: Supabase Migrations for Local Data

Create migrations for 4 new tables that currently only exist as local TypeScript data:

1. **`education_articles`** — title, slug, category, track, content, image_url, read_time, status, created_at
2. **`courses`** — title, slug, description, type (course/ebook/bundle), price, original_price, is_active, is_featured, image_url, status
3. **`betting_sites`** — name, slug, logo, rating, bonus, sports (text[]), features (text[]), min_deposit, withdrawal_speed, license, url, warning, status
4. **`trading_ideas`** — user_id, username, handle, asset, direction, title, body, chart_image_url, timeframe, risk_level, is_pinned, is_featured, reactions (jsonb), comment_count, status
5. **`idea_comments`** — idea_id, user_id, username, body, parent_comment_id

Each table gets RLS enabled with public read for published content and authenticated write policies.

## Task 4: Sports Page Console Warning Check

Navigate to Sports page, switch to Betting Sites tab, and verify console is clean after the `forwardRef` fix applied to `BettingSiteCard.tsx`.

---

## Technical Summary

| Task | Files Modified | Complexity |
|------|---------------|------------|
| Compare bug fix | `Compare.tsx` | Small — add Select key reset |
| BrokerDetail tabs | `BrokerDetail.tsx` | Medium — add 2 tab panels |
| Supabase migrations | 2-3 migration files | Medium — DDL + RLS + enums |
| Console check | None — browser verification | Trivial |

