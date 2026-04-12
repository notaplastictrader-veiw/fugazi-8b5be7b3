

# Hero Section — Remove Logo & Capitalize Eyebrow Highlights

## Changes

### 1. Remove logo from Hero Section
Delete the logo block (the `<div className="flex justify-center mb-6">` wrapper with the `<img>` inside) from `HeroSection.tsx`. Also remove the `useTheme` import and `logoSrc` variable since they're only used for the logo here.

### 2. Capitalize first letter of eyebrow highlighted words
Update the `eyebrowItems` array — capitalize the first letter of each `highlight` value:

| Current | Updated |
|---------|---------|
| `fugazi ones` | `Fugazi Ones` |
| `most transparent` | `Most Transparent` |
| `scams get exposed` | `Scams Get Exposed` |
| `Real proof` | `Real Proof` (already correct) |
| `brokers fear` | `Brokers Fear` |

### Files to modify
- `src/components/sections/HeroSection.tsx`

