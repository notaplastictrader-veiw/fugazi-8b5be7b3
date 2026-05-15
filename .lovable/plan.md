## Plan: Add 1-5 Pagination to 3 Homepage Sections

### Goal
Convert 3 homepage sections that currently show all items at once into paginated views that display **1-5 items per page**, with Previous / Next navigation.

### Sections to Update

1. **PayoutSpeedLeaderboard** (`src/components/sections/PayoutSpeedLeaderboard.tsx`)
   - Currently shows 8 rows in a table.
   - Show max 5 rows per page. Add Prev/Next pagination controls under the table.
   - Keep the existing table header, speed bar, tier badges.

2. **ScamPulseRadar** (`src/components/sections/ScamPulseRadar.tsx`)
   - Currently shows all 12 pulse alerts in a vertical list.
   - Show max 5 alerts per page. Add Prev/Next pagination controls below the list, above the footer bar.
   - Keep the live badge, severity colors, and auto-refresh behavior.

3. **SignalHub** (`src/components/sections/SignalHub.tsx`)
   - Currently shows all signal groups in a 3-column grid.
   - Show max 5 groups per page. Add Prev/Next pagination controls below the grid.
   - Keep the glass-card styling and CMS-driven content.

### Reusable Approach
Create a small internal pagination hook or inline state pattern (`useState` for `page`, compute `slice(start, end)`) shared across all three. No new component file needed — keep it lightweight and consistent.

### Visual Details
- Prev / Next buttons: small rounded buttons with ChevronLeft / ChevronRight icons.
- Disabled state when on first / last page.
- Page indicator text: e.g. "Page 1 of 3" in mono font.
- Use existing semantic tokens (`border-border`, `bg-card`, `text-muted-foreground`, `text-primary`).

### No changes to
- Data fetching logic, Supabase queries, fallback data.
- Existing section styling, responsive behavior, lazy-loading.
- Other homepage sections.