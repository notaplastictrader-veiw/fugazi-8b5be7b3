

## Plan: Fix Light Theme Background Pattern

### Problem
The candlestick SVG (`public/images/candlestick-pattern.svg`) uses `white` / `stroke="white"` for all lines and shapes. On dark backgrounds this works fine, but on the light theme's pale background (`hsl(70 20% 94%)`), white strokes are invisible.

### Solution

#### 1. Create a dark version of the candlestick SVG for light theme
- New file: `public/images/candlestick-pattern-dark.svg`
- Same exact layout but strokes/fills use `black` instead of `white` at same low opacity (2-3%)

#### 2. Add light theme `body::before` override in `src/index.css`
Add a `[data-theme="light"] body::before` rule that uses `candlestick-pattern-dark.svg` and dark-tinted grid lines instead of white ones:
```css
[data-theme="light"] body::before {
  background-image:
    url('/images/candlestick-pattern-dark.svg'),
    linear-gradient(hsl(83 100% 30% / 0.04) 1px, transparent 1px),
    linear-gradient(90deg, hsl(83 100% 30% / 0.03) 1px, transparent 1px),
    ...
}
```

### Result
- Light theme gets visible candlestick grid pattern with dark strokes on light bg
- Same subtle intensity as dark/sentinel themes
- Clean, professional look with texture

### Files Modified
- `public/images/candlestick-pattern-dark.svg` — new file (dark stroke version)
- `src/index.css` — add `[data-theme="light"]` body::before override

