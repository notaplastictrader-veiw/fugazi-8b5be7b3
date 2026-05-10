## Goal
Hero subtitle e tagline **"We Test Brokers. You Trade Smarter."** show korano (currently "Unbiased broker reviews, real trader signals, and scam alerts — all in one place." dekhacche karon i18n translation override korche).

## Approach
2 ta line e dekhabo — tagline upore (bold/strong), description niche (muted):

```
We Test Brokers. You Trade Smarter.        ← tagline (bold, foreground)
Unbiased broker reviews, real trader 
signals, and scam alerts — all in one place. ← description (muted, smaller)
```

## Changes

**File: `src/components/sections/HeroSection.tsx`**
- H1 ("Broker Reviews / That Actually Matter.") er niche existing `<p>` ke replace korbo 2-line block diye:
  - Line 1: `"We Test Brokers. You Trade Smarter."` — `text-lg font-semibold text-foreground`
  - Line 2: existing `t("hero.subtitle", ...)` — `text-sm text-muted-foreground`
- Animation `animate-[fade-up_0.6s_ease_0.2s_both]` retain korbo

## Out of scope
- i18n translation key change kora hobe na (other languages e existing description thakbe)
- Badge ("Not a Fugazi Trader") ba headline change hobe na
- CMS / Admin editor change hobe na
