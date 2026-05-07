## Goal
Make the `/disclaimer` page feel less plain — especially the 3 most important risk-related sections — so users immediately understand them when they click "Read full disclaimer →" from the footer.

## What changes

Restructure `src/pages/Disclaimer.tsx` only. No new files, no DB, no copy changes.

### 1. Page header upgrade
- Add a top warning hero band: amber/destructive-tinted card with `AlertTriangle` icon, the title, and the "Last updated" line — instead of plain h1 + small grey date.
- Adds visual weight without changing the page route.

### 2. Three "critical" sections become highlighted callout cards
Convert these three into distinct callout blocks (not plain `<h2><p>`):
- **Financial & Trading Content** — TrendingDown icon, amber accent
- **Sports Predictions & Betting-Related Content** — Dice/Gamepad icon, orange accent
- **Liability** — ShieldAlert icon, destructive (red) accent

Each card:
- Left accent border (4px) in the section's accent color
- Subtle tinted background (`bg-destructive/5`, `bg-amber-500/5`, etc. via semantic tokens)
- Icon + bold label header row
- Generous padding (`p-6`), rounded corners, clear gap between cards
- Key phrases bolded (already are) plus an inline "highlight" pill where critical (e.g. "informational and educational purposes only", "no liability")

### 3. Secondary sections stay lighter
- **About NAFT**, **Third-Party Services**, **By Using NAFT** remain as normal prose blocks but with improved spacing (`space-y-8`, dividers between them) so the highlighted cards stand out by contrast.

### 4. Spacing & rhythm
- Wrap content in a `space-y-10` container.
- Increase section heading sizes slightly (`text-2xl font-display`).
- Add a thin `border-b border-border/40` divider between non-callout sections.

### 5. Footer CTA on the page
Add a small bottom strip linking back to Terms / Privacy / Contact with buttons instead of inline text — improves scannability after the user reads the disclaimer.

## Out of scope
- No content rewriting (legal text stays exactly as-is).
- No translations.
- No changes to footer summary / route / DB.
- No changes to Terms or Privacy pages.

## Technical notes
- Use existing semantic tokens (`destructive`, `muted`, `border`, `primary`) — no hardcoded colors.
- Icons from `lucide-react` (already a dependency).
- Keep `MainLayout` + `SEO` wrapper unchanged.
- Stays within `prose` only for body paragraphs inside cards; outer layout uses plain Tailwind.
