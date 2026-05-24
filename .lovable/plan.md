## Hero Background Cleanup

User feedback: hero background image cleanliness/visibility nosto korchhe. Remove the heavy photo background but keep the soft primary spotlight glow + the 3D "NO FUGAZI" floor text intact.

### Change

In `src/components/sections/HeroSection.tsx`:

1. Delete the theme-aware photo background `<div>` (lines 92-104) that renders `heroBg` with blur + radial mask.
2. Remove the now-unused imports: `heroBgDark`, `heroBgLight`, `heroBgSentinel`, the `heroBgByTheme` map, and the `heroBg` / `isLight` locals derived from `useTheme()`. Keep `useTheme` import only if still referenced elsewhere (it isn't — remove).
3. Keep the spotlight: the `bg-primary/8 rounded-full blur-[120px]` glow div (lines 106-108) stays.
4. Keep the "NO FUGAZI" 3D floor text block (lines 111-132) as-is.

Result: clean hero with subtle primary spotlight + floor text, no photo wash behind the headline.