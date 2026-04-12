

# Phase 3: User Dashboard + Global Search + SEO Optimization

Phase 3 এর তিনটা major feature একসাথে build করবো। Step-by-step implement করবো যাতে কোনো কিছু miss না হয়।

---

## Part A: Functional User Dashboard (`/dashboard`)

### Database Changes
1. **New table: `watchlist`** — users can save/bookmark brokers
   - `id`, `user_id`, `broker_id`, `created_at`
   - RLS: users can only CRUD their own watchlist items

2. **New table: `user_activity`** — track user actions (review submitted, complaint filed, etc.)
   - `id`, `user_id`, `action_type`, `content_id`, `created_at`
   - RLS: users view own activity, admins view all

### UI Components
3. **Dashboard Sidebar** — role-based navigation using existing Sidebar component
   - **All users**: Overview, My Reviews, My Complaints, Watchlist, Profile Settings
   - **Broker/Signal Provider**: + Analytics, Leads (existing admin dashboard data exposed)

4. **Dashboard Pages**:
   - **Overview** — real stats from DB (review count, watchlist count, complaint count, activity feed)
   - **My Reviews** — list of user's reviews with status badges (pending/published/rejected)
   - **My Complaints** — list of complaints filed by user
   - **Watchlist** — saved brokers grid with remove button
   - **Profile Settings** — edit name, phone, country, avatar (submits to profiles table)
   - **Activity Feed** — recent actions timeline

5. **Protected route** — redirect to login if not authenticated

---

## Part B: Global Search

### Implementation
6. **Search Command Palette** (Cmd+K / Ctrl+K) — modal overlay accessible from anywhere
   - Searches across: brokers, signals, news, scam alerts, forecasts, promotions
   - Uses Supabase `.ilike()` queries on name/title fields
   - Shows categorized results with icons
   - Keyboard navigation (arrow keys + enter)

7. **Navbar Integration** — search icon in navbar opens the palette
   - Also works from the Hero section search bar (connect existing search input)

8. **Debounced search** — 300ms debounce, minimum 2 characters

---

## Part C: SEO Optimization

### Structured Data
9. **JSON-LD schemas** added to key pages:
   - Homepage: `Organization` + `WebSite` with `SearchAction`
   - Broker listing: `ItemList`
   - Broker detail: `Review` + `AggregateRating`
   - News articles: `NewsArticle`

10. **Enhanced SEO component** — add JSON-LD injection support to existing `SEO.tsx`

### Technical SEO
11. **Sitemap generation** — static `sitemap.xml` in `/public` covering all public routes
12. **robots.txt update** — add sitemap reference
13. **Meta tags audit** — ensure all 14+ pages have unique title/description

---

## Technical Details

### New Files
- `src/pages/dashboard/*` — Overview, Reviews, Complaints, Watchlist, Settings (sub-pages)
- `src/components/dashboard/DashboardSidebar.tsx`
- `src/components/dashboard/DashboardLayout.tsx`
- `src/components/search/SearchPalette.tsx`
- `src/hooks/useGlobalSearch.ts`
- `src/components/seo/JsonLd.tsx`
- `public/sitemap.xml`
- 2 Supabase migrations (watchlist + user_activity tables)

### Modified Files
- `src/App.tsx` — add dashboard sub-routes, search palette provider
- `src/components/layout/Navbar.tsx` — add search trigger icon
- `src/components/sections/HeroSection.tsx` — connect search bar to global search
- `src/components/SEO.tsx` — add JSON-LD support
- `src/pages/UserDashboard.tsx` — refactor into layout with sidebar
- `public/robots.txt` — add sitemap URL

### Implementation Order
1. Database migrations (watchlist + user_activity)
2. Dashboard layout + sidebar
3. Dashboard sub-pages (Overview, Reviews, Complaints, Watchlist, Settings)
4. Global search palette + hook
5. Navbar + Hero search integration
6. JSON-LD structured data
7. Sitemap + robots.txt + meta audit

