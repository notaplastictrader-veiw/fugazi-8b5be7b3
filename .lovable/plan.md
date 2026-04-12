

# Add NAFT Logo to More Key Locations

The candlestick "N" logo is currently only in the Navbar and Footer. To make it instantly recognizable as your brand symbol, I'll add it to these high-visibility spots:

## Placements

### 1. Hero Section — Logo above the headline
Add the candlestick logo (48x48) centered above the "Not A Fugazi Trader" headline with a subtle glow effect. This is the first thing visitors see.

### 2. Auth Modal — Logo at the top
Add the logo (40x40) centered at the top of the login/signup modal, reinforcing brand identity during authentication.

### 3. 404 Page — Logo with error message
Add the logo above the "404" text so even error pages feel branded.

### 4. Loading/Splash feel — Browser tab
Already done (favicon). No change needed.

## Technical Details

All placements use the same theme-aware logic already in Navbar/Footer:
```typescript
const logoSrc = theme === "light" 
  ? "/images/naft-candlestick-light-green.svg" 
  : theme === "sentinel" 
    ? "/images/naft-candlestick-dark-red.svg" 
    : "/images/naft-candlestick-dark-lime.svg";
```

### Files to modify
- `src/components/sections/HeroSection.tsx` — add logo above h1
- `src/components/modals/AuthModal.tsx` — add logo at modal top
- `src/pages/NotFound.tsx` — add logo above 404 text

