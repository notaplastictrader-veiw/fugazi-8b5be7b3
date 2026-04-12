

# Remove Animation from "Not a Fugazi Broker" Badge

The "Not a Fugazi Broker 😉" badge is already positioned above the rotating eyebrow — correct placement. The only change needed is removing the `animate-[fade-up_0.6s_ease_both]` class so it appears instantly without any fade-up animation.

## Change in `src/components/sections/HeroSection.tsx`

**Line 67** — Remove `animate-[fade-up_0.6s_ease_both]` from the badge's className:

```tsx
// Before
<div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border/40 bg-card/50 backdrop-blur-sm mb-3 text-xs text-muted-foreground font-mono animate-[fade-up_0.6s_ease_both]">

// After
<div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border/40 bg-card/50 backdrop-blur-sm mb-3 text-xs text-muted-foreground font-mono">
```

One class removal — badge stays put, no movement.

