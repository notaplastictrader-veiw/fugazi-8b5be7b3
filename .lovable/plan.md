## Goal
Homepage Hero section er pichone reference image er moto cinematic background — ekjon manush + spotlight glow — subtle texture hisebe (10-15% opacity, heavy blur), 3 ta theme er jonno 3 ta alada variant.

## Visual concept
- **Composition**: Lone silhouette figure, edge of a cliff/platform, spotlight glow rising from below
- **Treatment**: Heavy blur (40-60px), 10-15% opacity, vignette overlay so text fully readable
- **Position**: Behind hero content, above the existing "NO FUGAZI" 3D floor text (layered)
- **Mobile**: Same image, slightly higher opacity OK since less text density

## Theme variants (3 images)
1. **Dark theme** → Lime/electric green spotlight glow (matches `--primary` lime)
2. **Light theme** → Soft green glow on lighter charcoal-cream gradient backdrop (lighter base so it doesn't fight light bg)
3. **Sentinel theme** → Red/crimson spotlight glow (matches Sentinel red accent)

## Demo-first workflow
Step 1: Generate **3 preview images** (one per theme) using imagegen, save to `src/assets/hero-bg-{dark,light,sentinel}.jpg`
Step 2: Wire them into `HeroSection.tsx` behind existing layers, theme-switched via `useTheme()` hook
Step 3: User reviews live preview across all 3 themes → approves/rejects/asks for tweaks
Step 4: If rejected, easy rollback (single component, no global changes)

## Technical details
- **File**: `src/components/sections/HeroSection.tsx` — add one `<div>` layer absolutely positioned, `z-0`, behind existing content (which is `z-10`)
- **Theme detection**: Use existing `useTheme()` hook from `src/hooks/useTheme.ts` to switch `background-image`
- **CSS**: `bg-cover bg-center opacity-[0.12] blur-[2px]` + radial vignette mask (`mask-image: radial-gradient`) so edges fade to background
- **Performance**: JPG format, ~1600x1000 max, lazy not needed (above fold but small)
- **Light theme caveat**: Lighter version with inverted treatment — may need a soft gradient overlay to maintain contrast

## Out of scope
- Other sections (Signal Channel, CTAs, etc.) — Hero only
- Spotlight as animated/interactive element — pure static background
- Replacing existing "NO FUGAZI" 3D floor text or hero-grain texture (layered together)
- Other pages (Brokers, Compare, etc.)

## Files touched
1. `src/assets/hero-bg-dark.jpg` (new, generated)
2. `src/assets/hero-bg-light.jpg` (new, generated)
3. `src/assets/hero-bg-sentinel.jpg` (new, generated)
4. `src/components/sections/HeroSection.tsx` (add background layer + theme switching)
