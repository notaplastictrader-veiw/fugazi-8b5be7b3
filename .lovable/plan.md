# Hero Stats — Fix Broken Layout

## Problem
On desktop the Live badge sits at the far-left edge while the four stats float far to the right, with a huge empty gap and no visible divider — looks broken/disconnected, not like one cohesive pill.

## Root cause
The strip uses `glass-card rounded-full` as the outer container that stretches to full hero width, with `sm:justify-center` on the inner flex. Because the inner content is much narrower than the container, Live and the stats group both center as one cluster — but the eye reads the wide rounded background as the "pill" and the content inside as misaligned. Worse, the divider between Live and stats is hidden by `sm:border-r` on Live (it sits at the wrong side).

## Fix

### 1. Pill hugs its content
Wrap the strip in a centered `inline-flex` so the rounded pill sizes to its contents (no more giant empty pill). Outer wrapper centers it inside the hero column.

### 2. Single coherent row on tablet+
- Live · `|` · Stat · Stat · Stat · Stat — all in one flex row with consistent `gap-3 md:gap-4`.
- Vertical divider after Live: `w-px h-4 bg-border/60` (dedicated element, not border on the badge — guarantees it shows).
- Live badge keeps green pulsing dot + `LIVE` label.

### 3. Mobile (<640px)
- Pill becomes a rounded-2xl card.
- Live row on top (dot + label + thin underline), stats in 2×2 grid below with the same icon + value + label pattern.
- Everything still inside one card so it reads as one unit.

### 4. Visual polish
- Tighten label size to `text-[10px] md:text-[11px]`, value `text-sm md:text-base`, icon `w-3.5 h-3.5` — same as now, no clipping.
- Remove `truncate` from labels (caused some labels to ellipsize on tablet) — replace with `whitespace-nowrap`.
- Keep all 4 stats wired to backend (reviews / brokers / scams counts + visitors from `site_settings.hero_section.visitors_value`, default `1.2M+`).

### 5. Verification
- Visual check at 360, 414, 768, 1024, 1194, 1440 widths — pill hugs content, Live + divider + 4 stats are a tight single row on ≥640, 2×2 grid below Live on <640.
- No horizontal scroll, no clipped labels.

## File touched
- `src/components/sections/HeroSection.tsx` — only the stats strip block + its wrapper.
