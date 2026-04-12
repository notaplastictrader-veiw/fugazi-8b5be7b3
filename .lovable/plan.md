

## Plan: Add Subtle Trading-Themed Background Pattern

### What
Add the already-created candlestick SVG pattern (`public/images/candlestick-pattern.svg`) as a tiling background layer on all 3 themes. Keep it extremely subtle so content stays readable and the site looks clean.

### Changes — `src/index.css`

#### Update `body::before` (all themes)
Add the candlestick SVG as an additional background layer on top of the existing grid:
- `url('/images/candlestick-pattern.svg')` tiled with `repeat`, sized at ~400px
- Very low opacity via the SVG itself (already 2-3% opacity white strokes)
- Keep existing grid lines but reduce their opacity slightly so the combined effect isn't too heavy

#### Sentinel theme override
Same approach — add the candlestick pattern layer to the sentinel-specific `body::before` as well.

#### Result
- All 3 themes get a faint candlestick chart pattern tiling behind content
- Grid lines + candlesticks together create a "trading terminal" feel
- Opacity kept at ~2-3% so text/cards remain fully readable
- No distraction, just subtle texture

### Files Modified
- `src/index.css` — add SVG background layer to `body::before` for all themes

