

# Light Theme — Premium Warm Multi-Tone Redesign

## Vision
The current light theme uses cold blue-grey tones (`220 hue`) which feels dated. The reference image shows a warm, premium aesthetic with beige/cream backgrounds, rich brown accents, and gold highlights — a 2025 luxury feel.

## Changes

### File: `src/index.css` — Light theme CSS variables

Replace all `[data-theme="light"]` HSL values with a warm beige/brown/gold palette:

| Token | Current (cold grey) | New (warm premium) |
|-------|--------------------|--------------------|
| `--background` | `220 10% 82%` | `30 25% 92%` (warm cream) |
| `--foreground` | `220 20% 12%` | `25 30% 15%` (rich dark brown) |
| `--card` | `220 10% 88%` | `30 20% 96%` (off-white warm) |
| `--card-foreground` | `220 20% 12%` | `25 30% 15%` |
| `--popover` | `220 10% 88%` | `30 20% 96%` |
| `--primary` | `83 100% 30%` (green) | `28 60% 45%` (rich warm brown) |
| `--primary-foreground` | `0 0% 100%` | `30 25% 96%` (cream white) |
| `--secondary` | `220 10% 76%` | `30 15% 85%` (light beige) |
| `--secondary-foreground` | `220 15% 25%` | `25 25% 25%` |
| `--muted` | `220 8% 74%` | `30 12% 88%` (muted beige) |
| `--muted-foreground` | `220 8% 45%` | `25 15% 50%` |
| `--accent` | `43 86% 45%` | `38 70% 50%` (warm gold) |
| `--accent-foreground` | `0 0% 100%` | `30 25% 96%` |
| `--border` | `220 10% 72%` | `30 15% 82%` (warm border) |
| `--input` | `220 10% 72%` | `30 15% 82%` |
| `--ring` | `83 100% 30%` | `28 60% 45%` |
| `--teal` | `174 65% 40%` | `174 45% 40%` (slightly muted) |
| `--coral` | `14 100% 55%` | `14 70% 50%` (warmer) |
| `--purple` | `260 80% 55%` | `260 50% 50%` (muted luxury) |
| Sidebar tokens | cold grey `220` hues | Matching warm `25-30` hues |

### File: `src/index.css` — Light theme body grid overlay

Update the `[data-theme="light"] body::before` grid colors from cold blue `hsl(220 15% 50%)` to warm brown tones `hsl(30 20% 50%)` to match the new palette.

### Files Modified
- `src/index.css` — Light theme variables + grid overlay

