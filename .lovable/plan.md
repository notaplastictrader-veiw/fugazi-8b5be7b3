

# Complete All Missing Pages & Fix Broken Links

## Current Status
21 pages done, but **8 linked routes lead to 404** because the pages don't exist yet.

## What Can Be Done Now (No API/Premium Needed)

### 1. Create `/ideas` — Share Ideas Page
Community idea board with a submission form (title, description, category). Ideas stored in Supabase table. Users can browse and submit ideas.

### 2. Create `/partnership` — Partnership Page (3 tabs)
- **Affiliate** tab: Earn commissions referring traders
- **IB (Introducing Broker)** tab: Partner as an IB
- **Collaboration** tab: Brand/content collaboration
Each tab has info + application form. Tab selected via `?tab=` query param.

### 3. Create `/terms` — Terms & Conditions Page
Static legal page with standard trading platform T&C content.

### 4. Create `/privacy` — Privacy Policy Page
Static legal page with GDPR-compliant privacy policy.

### 5. Create `/cookies` — Cookie Policy Page
Static page explaining cookie usage (ties into existing CookieConsent component).

### 6. Create `/advertise` — Advertise With Us Page
Info page with ad placement options + contact form for advertisers.

### 7. Create `/forecasts` — Forecasts Page
Standalone page showing forex/crypto/gold forecasts from existing Supabase `forecasts` table. Supports `?tab=forex|crypto|gold` filter.

### 8. Contact Form Backend
Wire existing contact form to save submissions to a new `contact_submissions` Supabase table.

## What Needs External Setup (Skip for Now)
| Item | What's Needed |
|------|--------------|
| Google OAuth | Configure in Supabase Auth dashboard |
| Live market prices | Real-time API (e.g. TradingView widget or forex API key) |
| Email notifications | Email service (Resend connector or SMTP) |
| Education lesson content | Individual lesson markdown/content to be written |

## Files to Create/Modify
- **7 new pages**: `src/pages/Ideas.tsx`, `Partnership.tsx`, `Terms.tsx`, `Privacy.tsx`, `Cookies.tsx`, `Advertise.tsx`, `Forecasts.tsx`
- **1 migration**: `contact_submissions` table + optionally `ideas` table
- **`src/App.tsx`**: Add 7 new routes
- **`src/components/layout/Footer.tsx`**: Fix `/signals/ours` link

## Estimated: ~7 files created, 2 files modified, 1 migration

