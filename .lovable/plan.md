

## Plan: Sentinel Theme Overhaul + Background Textures

### What the user wants
1. **Sentinel (red) theme** should match the reference image: deep dark blue-teal background (like `hsl(200, 30%, 12%)`) with vibrant red accents — not the current dark green-black
2. **Background texture** on all themes — the current `body::before` grid overlay is too subtle/invisible. Make it more visible with a forex-chart-inspired pattern (candlestick grid lines, slightly higher opacity)

### Changes

#### 1. Sentinel Theme Colors (`src/index.css`)
Shift from green-tinted dark (`160 40% 2%`) to a deep blue-teal base matching the reference:
- `--background`: `200 35% 10%` (deep dark teal-blue like the image)
- `--card`: `200 30% 13%`
- `--foreground`: `200 15% 90%`
- `--primary`: `2 80% 50%` (brighter red, matching reference)
- `--secondary`: `200 25% 15%`
- `--muted`: `200 20% 14%`
- `--border`: `200 20% 18%`
- All sidebar vars updated to match the blue-teal base
- Keep accent warm orange

#### 2. Background Pattern — More Visible (`src/index.css`)
Update `body::before` to be actually noticeable:
- Increase grid opacity from `0.025/0.015` to `0.04/0.03`
- Add a subtle candlestick-like pattern: small vertical tick marks using additional gradient layers
- Add a faint radial glow in the center for depth

#### 3. Theme-specific background tweaks
Add `[data-theme="sentinel"] body::before` override so the sentinel theme uses red-tinted grid lines instead of primary (green) ones, matching its color scheme.

### Files Modified
- `src/index.css` — sentinel theme vars + background pattern updates

