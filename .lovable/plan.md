## Floating Help FAB — 4 Options

Update `src/components/FloatingActions.tsx` to expand into 4 labeled options with a small "Help" label on the trigger.

### Trigger button
- Keep circular FAB but add small "Help" text next to the `+` icon (rounded-pill shape, primary color).
- When open: show `X` icon with "Close" label.

### 4 Action items (each shows icon + text label pill)

1. **AI Quick Assist** — `Sparkles` icon, opens `AIChatSheet` (existing behavior).
2. **Live Chat** — `MessageCircle` icon, opens the support team live chat on the website.
3. **Telegram** — Telegram-style icon (`Send` from lucide), links to `https://t.me/notafugazitrader` in new tab. Brand color `#229ED9`.
4. **WhatsApp** — WhatsApp green icon (`MessageCircle` styled with `#25D366`), shown as **disabled / "Coming soon"** — non-clickable, reduced opacity, tooltip/label says "WhatsApp — Coming soon".

Each option appears as a row: `[Label pill] [Icon button]`, stacked vertically right-aligned above the trigger. Staggered fade/translate animation on open (existing pattern).

### Live Chat clarification needed
The "Live Chat" option — need to confirm what powers it. Options:
- **A)** A new in-site chat widget (would need backend / Supabase realtime + agent dashboard) — large scope.
- **B)** Placeholder for now — opens a simple contact modal or routes to a `/support` page with a contact form, until a real live chat system is wired up.
- **C)** Use a third-party widget (Tawk.to / Crisp / Intercom) — needs user's account.

For this iteration I'll go with **B (placeholder)**: clicking "Live Chat" opens a small modal saying "Our support team will respond shortly" with a contact form (name, email, message) that saves to a `support_messages` table — OR simply routes to `/contact`. **Please confirm B or pick A/C.**

### Files changed
- `src/components/FloatingActions.tsx` — restructure to 4 options + labels + Help trigger.

No other files touched unless you confirm Live Chat option A or C.
