

# Tighten Badge & Eyebrow Boxes + Move Both Higher

## Changes in `src/components/sections/HeroSection.tsx`

### 1. Badge (line 67-71)
- Reduce padding from `px-4 py-2` to `px-3 py-1`
- Reduce bottom margin from `mb-6` to `mb-3`
- Add negative top margin `mt-[-8px]` to pull it closer to navbar

### 2. Eyebrow (line 73)
- Reduce padding from `px-4 py-2` to `px-3 py-1.5`
- Reduce height from `h-[36px]` to `h-[30px]`
- Keep `mb-4`

Both boxes become tighter/more compact and sit slightly higher in the section.

### File
- `src/components/sections/HeroSection.tsx`

