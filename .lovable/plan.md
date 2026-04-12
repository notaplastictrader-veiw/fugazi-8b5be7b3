

# Search Bar Theme-Tinted Border

## Change

In `src/components/sections/HeroSection.tsx` line 105, update the search bar container to add a subtle primary-colored border and background tint:

**Current:**
```
glass-card rounded-[14px] overflow-hidden focus-within:border-primary/40 transition-colors
```

**New:**
```
rounded-[14px] overflow-hidden bg-card/40 border border-primary/20 backdrop-blur-xl focus-within:border-primary/50 focus-within:shadow-[0_0_12px_hsl(var(--primary)/0.1)] transition-all
```

This gives the search bar:
- A subtle primary-colored border (`border-primary/20`) that matches the active theme
- Slightly stronger border on focus (`border-primary/50`)
- A soft glow on focus matching the theme color
- Removes the generic `glass-card` class in favor of explicit styling for more control

### File
- `src/components/sections/HeroSection.tsx` (line 105 only)

