

# Style "Not a Fugazi Broker 😉" Badge Like the Eyebrow

## What changes

### In `src/components/sections/HeroSection.tsx` (line 67-69)

Replace the current plain badge styling with the same colored highlight style used in the eyebrow — `border-primary/20`, `bg-primary/5`, matching the eyebrow's rounded-full pill look with the subtle primary color tint. Remove the current `border-border/40 bg-card/50 backdrop-blur-sm` styling.

**Before:**
```tsx
<div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border/40 bg-card/50 backdrop-blur-sm mb-3 text-xs text-muted-foreground font-mono">
  Not a Fugazi Broker 😉
</div>
```

**After:**
```tsx
<div className="inline-flex items-center px-4 py-2 rounded-full border border-primary/20 bg-primary/5 mb-3 text-xs text-muted-foreground font-mono">
  Not a Fugazi Broker 😉
</div>
```

This keeps the badge centered above the eyebrow, below the navbar, and gives it the same soft colored pill appearance as the rotating eyebrow below it.

### File to modify
- `src/components/sections/HeroSection.tsx`

