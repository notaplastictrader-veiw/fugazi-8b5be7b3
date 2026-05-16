## Goal
1. Emails should auto-match the recipient's active NAFT theme (Dark lime / Light green / Sentinel red) instead of being hardcoded.
2. Every email must include a Risk & Liability Disclaimer footer (matching `/disclaimer` page).

## How theme detection works
The user's current theme is stored client-side (localStorage `naft-theme`). To make server-sent emails theme-aware, we need the theme persisted **per user**. Two options:

**Option A (recommended):** Add a `theme_preference` column to `profiles` table (`'dark' | 'light' | 'sentinel'`, default `'dark'`). Sync it from `useTheme` hook whenever the user changes theme (if logged in). The `send-email` edge function reads the recipient's profile and renders the matching palette.

**Option B (simpler, less accurate):** Pass `theme` explicitly in every `send-email` call from the frontend (works only when triggered client-side; server-side jobs default to dark).

I recommend **A** — it works for all triggers (cron, admin actions, signups).

## Implementation

### 1. DB migration
- Add `profiles.theme_preference text default 'dark' check (theme_preference in ('dark','light','sentinel'))`.

### 2. Frontend sync
- In `src/hooks/useTheme.ts`: when theme changes AND user is authenticated, upsert `profiles.theme_preference`.

### 3. Edge function refactor (`supabase/functions/send-email/index.ts`)
Refactor into a clean template system:

```ts
// THEME_PALETTES: dark | light | sentinel
// Each palette: bg, card, text, muted, accent, accentText, border, headingFont, bodyFont
// renderEmail(theme, { eyebrow, heading, body, ctaText, ctaUrl, extraBlocks }) -> html
// Always appends DISCLAIMER_FOOTER block
```

- Add `theme?: 'dark'|'light'|'sentinel'` to `BodySchema`.
- Resolution order: explicit `theme` param → recipient's `profiles.theme_preference` (lookup by email) → `'dark'`.
- Build all 8 templates (welcome, verify, reset, scam alert, review approved, premium signal, complaint update, referral) using the shared renderer so they all auto-theme.

### 4. Disclaimer footer (appended to every email)
Compact version of `/disclaimer` content:
> **Risk & Liability Disclaimer** — NAFT is an independent information & review platform. We are not a broker, advisor, signal provider, or bookmaker. All content is for informational/educational purposes only and not financial advice. Trading FX/CFDs/crypto carries high risk; past performance ≠ future results. Sports/betting content is for entertainment only. NAFT accepts no liability for any losses. [Full disclaimer](https://fugazi.lovable.app/disclaimer) · [Terms](https://fugazi.lovable.app/terms) · [Privacy](https://fugazi.lovable.app/privacy) · [Unsubscribe]

Styled muted, small (11px), with top border in theme's border color.

### 5. Palettes (HSL → hex for email-client safety)
- **Dark:** bg `#0f0f10`, card `#18181b`, text `#fafafa`, accent `#bef264` (lime), accentText `#0f0f10`
- **Light:** bg `#fafaf7`, card `#ffffff`, text `#0f0f10`, accent `#16a34a` (green), accentText `#ffffff`
- **Sentinel:** bg `#0a1a24`, card `#102935`, text `#e6eef2`, accent `#e63329` (red), accentText `#ffffff`

### 6. Test
Send all 8 templates to `mdimranhossaindipto@gmail.com` in each of the 3 themes (24 emails total) via `curl_edge_functions`, passing `theme` explicitly to verify rendering.

## Files touched
- `supabase/migrations/<new>.sql` (add column)
- `supabase/functions/send-email/index.ts` (refactor + theme resolver + disclaimer footer + 8 templates)
- `src/hooks/useTheme.ts` (sync to profile)

## Out of scope
- Changing the actual transactional triggers (signup hook, scam alert dispatcher, etc.) — those will pick up theme automatically once the function reads `profiles`.
