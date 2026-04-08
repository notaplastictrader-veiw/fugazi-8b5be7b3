

## Concrete Grunge Text Effect (Matching Reference)

### What the reference shows
The uploaded image shows text that looks like **stamped concrete/stone** — the base text color is a muted gray-white, and the texture is **dark speckles/dust scattered across the surface** of the letters. It's subtle, readable, and looks like weathered stone or printed on rough paper. No blur, no glow — just a speckled, slightly worn surface.

### Problem with current approach
The current `mix-blend-mode: multiply` with the SVG noise on a dark background effectively does nothing visible (multiplying dark with dark = dark). On dark themes, `multiply` darkens — but the text is already light on dark, so the overlay disappears or looks muddy.

### New approach — Use `screen` blend + dark noise speckles

Instead of `multiply`, use the noise as a **subtractive mask** that removes bits of the text color, creating the "worn concrete" look:

1. Base text: solid foreground color, no text-shadow (clean)
2. `::after` overlay: high-frequency noise with `mix-blend-mode: screen` on dark theme (or use a different technique — apply the noise as a **mask** using `mask-image` so dark spots in the noise literally erase parts of the text)

Actually, the cleanest approach matching the reference: **use `mask-image` with SVG noise** so that random dark spots in the noise punch tiny holes in the text, creating that speckled/dusty concrete look.

### Files to change

**`src/index.css`** — Rewrite `.grunge-text` and `.grunge-text-accent`:

- Remove `::after` pseudo-element approach entirely
- Keep text as solid color (not transparent)
- Apply `-webkit-mask-image` / `mask-image` with an inline SVG noise pattern directly on the text element
- The noise mask will have spots of varying opacity, creating the speckled erosion
- Use `baseFrequency='0.7'` with high contrast for visible but subtle speckles
- Remove all `text-shadow` — the reference has no shadows
- Remove `hero-grain` pseudo-elements if any remain
- Keep `.grunge-text-accent` with same mask technique but primary color

**`src/components/sections/HeroSection.tsx`** — Minor cleanup:
- Can remove `data-text` attributes since we no longer need `::after` with `content: attr(data-text)`
- Keep `hero-grain` wrapper div (now just `position: relative`, no pseudo-elements)

### Result
Clean, readable text with subtle dark speckles/dust across the surface — exactly like stamped concrete or weathered stone typography from the reference image.

