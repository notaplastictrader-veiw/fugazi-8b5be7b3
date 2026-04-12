

# Nav Top-Level Links Bold Update

## Change

In `src/components/layout/Navbar.tsx`, add `font-medium` to the top-level nav links for better visibility:

1. **Line 114** — Non-highlighted dropdown buttons: add `font-medium`
   - Current: `text-muted-foreground hover:text-foreground`
   - New: `text-muted-foreground hover:text-foreground font-medium`

2. **Line 122** — Regular links (Prop Firms, Sports, Signals, Education): add `font-medium`
   - Current: `text-[13px] text-muted-foreground hover:text-foreground`
   - New: `text-[13px] text-muted-foreground hover:text-foreground font-medium`

Dropdown items and the "More" highlighted link (already `font-semibold`) stay unchanged.

### File
- `src/components/layout/Navbar.tsx` (2 lines)

