

## Cinematic Grunge Text for Hero Section

### What changes
Apply a cinematic, grainy, slightly dirty movie-poster texture effect to the **hero title** ("Not A Plastic" and "Trader.") and the **eyebrow highlight pills** only. Everything else stays clean.

### Approach — CSS-only noise texture + text effects

No images needed. We'll use CSS `filter`, subtle `text-shadow` layering, and an inline SVG noise filter to create a film-grain look.

### Files to change

**1. `src/index.css`** — Add a grunge text utility class

```css
.grunge-text {
  /* Layered text-shadow for rough, inky edges */
  text-shadow:
    2px 1px 0px hsl(var(--foreground) / 0.15),
    -1px -1px 0px hsl(var(--foreground) / 0.08),
    0px 0px 8px hsl(var(--foreground) / 0.05);
  /* Slight contrast boost for that printed-on-paper feel */
  filter: contrast(1.15) brightness(1.02);
  /* Subtle letter roughness via paint-order */
  -webkit-text-stroke: 0.3px hsl(var(--foreground) / 0.1);
}

.grunge-text-accent {
  text-shadow:
    2px 1px 0px hsl(var(--primary) / 0.25),
    -1px -1px 0px hsl(var(--primary) / 0.1),
    0px 0px 12px hsl(var(--primary) / 0.15);
  filter: contrast(1.15) brightness(1.05);
  -webkit-text-stroke: 0.3px hsl(var(--primary) / 0.15);
}
```

Add an SVG noise filter (inline in CSS via `background-image` on a pseudo-element overlay) on the hero title wrapper for subtle grain:

```css
.hero-grain::after {
  content: '';
  position: absolute;
  inset: 0;
  opacity: 0.06;
  mix-blend-mode: overlay;
  pointer-events: none;
  background-image: url("data:image/svg+xml,...turbulence fractalNoise...");
  z-index: 1;
}
```

**2. `src/components/sections/HeroSection.tsx`**

- Add `grunge-text` class to the `<h1>` tag (the big title)
- Add `grunge-text-accent` class to the `<span className="text-primary">Trader.</span>`
- Wrap the title in a `relative` div with `hero-grain` class for the noise overlay
- Eyebrow highlight pills: add a subtle `text-shadow` via inline style for the colored highlight text

### What it looks like
- Big bold "Not A Plastic" gets rough inky edges, slight glow, and a grain overlay — like stamped/printed type on a movie poster
- "Trader." in accent color gets a colored glow version of the same effect
- Eyebrow highlights get a subtle colored glow
- Rest of the page stays perfectly clean

