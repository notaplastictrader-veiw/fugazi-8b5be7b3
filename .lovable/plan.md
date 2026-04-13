

# PromoTicker Link + Breadcrumb Navigation + Glass-Card Tint

## Changes

### 1. PromoTicker — "PROMOTIONS" label clickable + arrow symbol
**File: `src/components/sections/PromoTicker.tsx`**
- Wrap the "PROMOTIONS" `<span>` in a `<Link to="/promotions">` so clicking it navigates to the promotions page
- Add a `«` or `◀` arrow symbol to the left of "PROMOTIONS" text (pointing in the direction the ticker items scroll from) for visual attraction
- Import `Link` from `react-router-dom`

### 2. Breadcrumb / Back Navigation on all pages
**File: `src/components/layout/MainLayout.tsx`**
- Add a compact breadcrumb bar below the navbar area (inside `<main>`) showing: `Home > Current Page`
- Use `useLocation()` to detect the current path and generate a readable page name
- "Home" links to `/`, current page name is derived from the route
- On the homepage itself, hide the breadcrumb
- Include a `←` back arrow that uses `navigate(-1)` to go to the previous page

### 3. Glass-card tint fix
**File: `src/index.css`**
- Update `.glass-card` to add a subtle primary color tint: change `background: hsl(var(--card) / 0.6)` to include a slight `hsl(var(--primary) / 0.03)` overlay or adjust opacity so cards aren't purely transparent/mirror-like
- Add a subtle `box-shadow` with primary tint for depth

### Files Modified
- `src/components/sections/PromoTicker.tsx` — Link + arrow
- `src/components/layout/MainLayout.tsx` — Breadcrumb bar
- `src/index.css` — Glass-card tint

