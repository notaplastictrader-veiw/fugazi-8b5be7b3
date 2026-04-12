

# PromoTicker Fire Emoji + Light Theme Background Fix

## Current State
1. **Fire emoji**: Already present in PromoTicker (`🔥 PROMOTIONS` on line 33). No change needed.
2. **Light theme background**: Currently `220 15% 96%` — this is near-white. The APOX reference image shows a medium steel-grey around `220 10% 78%`. They don't match.

## Changes

### 1. `src/index.css` — Darken light theme background to match APOX steel-grey

Adjust these tokens in `[data-theme="light"]`:

| Token | Current | New | Why |
|-------|---------|-----|-----|
| `--background` | `220 15% 96%` | `220 10% 82%` | Closer to APOX steel-grey |
| `--card` | `220 10% 99%` | `220 10% 88%` | Cards slightly lighter than bg |
| `--popover` | `220 10% 99%` | `220 10% 88%` | Match card |
| `--secondary` | `220 10% 92%` | `220 10% 76%` | Darker secondary for contrast |
| `--muted` | `220 8% 90%` | `220 8% 74%` | Match darker palette |
| `--border` | `220 10% 88%` | `220 10% 72%` | Visible borders on darker bg |
| `--input` | `220 10% 88%` | `220 10% 72%` | Match border |
| `--sidebar-background` | `220 12% 98%` | `220 10% 78%` | Match main bg |
| `--sidebar-accent` | `220 10% 92%` | `220 10% 76%` | Match secondary |

Text colors (`--foreground`, `--card-foreground`) stay dark (`220 20% 12%`) for good contrast on the steel-grey surface.

### Files
- `src/index.css` (light theme block only, ~10 lines changed)

