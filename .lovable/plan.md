

# Light Theme Premium Upgrade — APOX-Inspired

The uploaded image shows a sleek, cool-grey premium aesthetic with subtle metallic tones. The current light theme uses warm cream/green tones which feel casual. We'll shift it toward a cooler, more refined palette inspired by the image.

## Changes

### 1. `src/index.css` — Light theme CSS variables (lines 46-75)

Update the `[data-theme="light"]` color palette:

| Token | Current | New | Reason |
|-------|---------|-----|--------|
| `--background` | `70 20% 94%` (warm cream) | `220 15% 96%` (cool silver-grey) | Premium cool base |
| `--card` | `0 0% 100%` (pure white) | `220 10% 99%` (soft cool white) | Subtle coolness |
| `--secondary` | `70 10% 90%` | `220 10% 92%` | Match cool tone |
| `--muted` | `70 10% 88%` | `220 8% 90%` | Cooler muted |
| `--muted-foreground` | `75 10% 40%` | `220 8% 45%` | Refined grey text |
| `--border` | `70 10% 85%` | `220 10% 88%` | Cool border |
| `--input` | `70 10% 85%` | `220 10% 88%` | Match border |
| `--foreground` | `75 30% 8%` | `220 20% 12%` | Deeper, cooler black |
| `--card-foreground` | `75 30% 8%` | `220 20% 12%` | Match foreground |
| `--popover` | `0 0% 100%` | `220 10% 99%` | Match card |
| `--popover-foreground` | `75 30% 8%` | `220 20% 12%` | Match foreground |
| `--secondary-foreground` | `75 20% 25%` | `220 15% 25%` | Cooler |

Also update the light theme `body::before` grid overlay to use the same cool hue (220) instead of green (83) for a more premium metallic grid feel.

### 2. `src/index.css` — Light theme grid overlay (lines ~131-140)

Update the grid line colors from `hsl(83 100% 30% / ...)` to `hsl(220 15% 50% / ...)` for a subtle silver-grey grid instead of green-tinted.

### Files
- `src/index.css` only

