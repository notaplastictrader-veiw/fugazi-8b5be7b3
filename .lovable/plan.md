

# Fix Background Logo — Remove Cluttered NAFT Broadcast Accent

## Problem
The broadcast logo placed in the Hero section background at 4% opacity looks messy — "NAFT" text is partially visible but unclear, creating visual clutter rather than a polished accent.

## Solution
Remove the broadcast logo from HeroSection entirely. The body already has a candlestick grid pattern overlay (`body::before` in `index.css`) which provides the trading-terminal aesthetic. Adding another SVG logo on top makes it look busy and unclear.

## Changes

### `src/components/sections/HeroSection.tsx`
- Remove the `<img src="/images/naft-broadcast.svg" ...>` element from the background div (line 63)
- Keep the blurred primary glow effect — that adds depth without clutter

**Before:**
```tsx
<div className="absolute inset-0 pointer-events-none">
  <div className="absolute top-1/4 left-1/2 ... blur-[120px]" />
  <img src="/images/naft-broadcast.svg" alt="" className="absolute top-[15%] right-[8%] w-[220px] h-[220px] opacity-[0.04]" />
</div>
```

**After:**
```tsx
<div className="absolute inset-0 pointer-events-none">
  <div className="absolute top-1/4 left-1/2 ... blur-[120px]" />
</div>
```

One line removal. Clean background, no clutter.

