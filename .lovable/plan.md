# Hero Stats — Live + Fully Visible

## Goal
Bring back the **Live** badge, connect every metric to real backend data (no fake numbers), and make the entire strip readable at one glance on mobile, tablet and desktop — no horizontal scroll.

## What changes

### 1. Live badge — restored
Pulsing green dot + `LIVE` label at the start of the strip, separated by a vertical divider. Confirms the row is real-time.

### 2. All 4 stats wired to backend
| Slot | Source | Label |
|------|--------|-------|
| 1 | `reviews` table (status=published) count | Verified reviews |
| 2 | `brokers` table (status=published) count | Brokers listed |
| 3 | `scam_alerts` table (status=published) count | Scam alerts |
| 4 | `site_settings.hero_visitors` (admin-editable, falls back to `1.2M+`) | Website visitors |

- Visitors stat becomes editable from the site settings store (admin can update without a code change). Default value `1.2M+` until set.
- All four numbers refresh on mount; failed fetches keep the last good value instead of showing `—`.

### 3. One-glance visibility on every device
Replace the horizontal scroll with a layout that always fits:

```text
Mobile (<480px)         2×2 compact grid, icon + number + tiny label
Small (480–767px)       Single row, abbreviated labels (REVIEWS, BROKERS, ALERTS, VISITORS)
Tablet+ (≥768px)        Single row, full labels, centered
```

- Live badge sits above the grid on mobile (full-width chip), inline on tablet+.
- Numbers stay bold + accent-colored; labels shrink to `text-[10px]` on small screens so nothing clips.
- Container uses `flex-wrap` only as a safety net — primary layout is the responsive grid above.

### 4. Verification
- Check at 360, 414, 768, 1024, 1194, 1440 widths — every stat label fully visible, no ellipsis, no scroll.
- Console check: 4 Supabase count queries fire once on load, no errors.

## Files touched
- `src/components/sections/HeroSection.tsx` — layout + Live badge + visitors source
- (optional) admin site-settings already supports arbitrary keys, so no schema change needed for `hero_visitors`
