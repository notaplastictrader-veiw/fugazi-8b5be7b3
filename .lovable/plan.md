

# Glass-Card — Revert Tint, Only Highlight Border

## Problem
তুমি শুধু box গুলোর border highlight করতে বলেছিলে, কিন্তু আমি background tint আর shadow ও বাড়িয়ে দিয়েছিলাম। সেটা আগের মতো ফিরিয়ে রাখবো, শুধু border টা আরেকটু visible করবো।

## Change

**File: `src/index.css`** — `.glass-card` class update:

| Property | Current | New |
|----------|---------|-----|
| background | `hsl(--card/0.7)` → `hsl(--primary/0.08)` gradient | Revert to original: `hsl(--card/0.7)` → `hsl(--primary/0.08)` — actually keep as original was `0.08` already |
| border | `1px solid hsl(--border/0.8)` | `1px solid hsl(--primary/0.25)` — primary-tinted border for highlight |
| box-shadow | `hsl(--primary/0.10)` | Revert to `hsl(--primary/0.10)` (keep same) |

Actually let me revert to the **original** values and only change border:

```css
.glass-card {
  background: linear-gradient(135deg, hsl(var(--card) / 0.7), hsl(var(--primary) / 0.08));
  border: 1px solid hsl(var(--primary) / 0.25);
  backdrop-filter: blur(12px);
  box-shadow: 0 4px 24px -4px hsl(var(--primary) / 0.10);
}
```

The only real change: border color from `hsl(--border/0.8)` → `hsl(--primary/0.25)` so the box edges glow with the primary color (lime/green/red depending on theme).

### Files Modified
- `src/index.css` — border highlight on `.glass-card`

