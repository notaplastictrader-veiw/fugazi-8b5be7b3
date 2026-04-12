

## Summary of Changes

The user wants:
1. **Night (dark) theme background** changed to grey tones (like the reference images — dark slate/charcoal instead of current green-black)
2. **Light (day) theme** stays as-is
3. **Dasara theme** renamed to something meaningful (forex/trading related), keep red color scheme
4. **"Plastic" replaced with "Fugazi"** everywhere (brand name becomes "Not A Fugazi Trader")
5. **"NAPT" replaced with "NAFT"** everywhere (abbreviation becomes NAFT)
6. **Background** should subtly reference forex trading/charting — minimal, like a faint candlestick or grid pattern

---

## Technical Plan

### 1. Rebrand: "Plastic" → "Fugazi", "NAPT" → "NAFT"

Update across ~18 files:
- **HeroSection.tsx**: "Not A Plastic" → "Not A Fugazi", eyebrow "plastic ones" → "fugazi ones"
- **Navbar.tsx**: Logo text
- **Footer.tsx**: Logo + copyright
- **SEO.tsx**: `SITE_NAME`, twitter handle
- **About.tsx**, **Contact.tsx**, **Login.tsx**, **Signup.tsx**: Brand references, email/telegram
- **News.tsx**: "NAPT Editorial" → "NAFT Editorial"
- **NewsAdmin.tsx**: Default author
- **AdminSidebar.tsx**: "NAPT Admin" → "NAFT Admin"
- **LiveChatButton.tsx**: Telegram link (keep actual URL but update display)
- **useTheme.ts**: `napt-theme` → `naft-theme`
- **CookieConsent.tsx**: `napt-cookie-consent` → `naft-cookie-consent`
- **LanguageSelector.tsx**: `napt-language` → `naft-language`
- All SEO descriptions mentioning "Plastic"
- **index.html** `<title>` tag

### 2. Dark Theme → Grey/Charcoal Tones

In `src/index.css`, update the `:root` / `[data-theme="dark"]` variables:
- Background: from green-black `67 18% 3%` → charcoal grey `220 10% 6%`
- Card: from `67 25% 8%` → `220 8% 10%`
- Border: from `73 30% 7%` → `220 8% 14%`
- Muted: grey-based instead of green-based
- Keep primary (lime green) and accent colors unchanged

### 3. Rename "Dasara" → "Sentinel" (Guard/Protector theme)

- Rename in `useTheme.ts`: type and cycle logic
- Rename in `Navbar.tsx`: theme label display
- Rename in `index.css`: `[data-theme="dasara"]` → `[data-theme="sentinel"]`
- Keep the red color palette intact

### 4. Forex-Themed Minimal Background

Replace the current grid overlay in `index.css` (`body::before`) with a subtle candlestick/chart-grid pattern using CSS:
- Faint vertical + horizontal grid lines (like a trading chart)
- Optional: tiny upward/downward tick marks at intersections to hint at candlesticks
- Very low opacity (2-3%) to stay minimal

### Files Modified
- `src/index.css` (themes + background)
- `src/hooks/useTheme.ts`
- `src/components/layout/Navbar.tsx`
- `src/components/layout/Footer.tsx`
- `src/components/sections/HeroSection.tsx`
- `src/components/SEO.tsx`
- `src/components/admin/AdminSidebar.tsx`
- `src/components/LiveChatButton.tsx`
- `src/components/CookieConsent.tsx`
- `src/components/LanguageSelector.tsx`
- `src/pages/Index.tsx`, `About.tsx`, `Contact.tsx`, `Login.tsx`, `Signup.tsx`, `News.tsx`
- `src/pages/admin/NewsAdmin.tsx`
- `index.html`

