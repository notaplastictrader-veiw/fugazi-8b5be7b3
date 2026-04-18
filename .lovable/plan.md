

## What you're asking
Improve the "Apply for Premium Access" modal:
1. Fix the **Trading Experience** dropdown — text is invisible on dark theme (white-on-white).
2. Add **Preferred Communication Method** field.
3. Add 3 qualifying questions: current broker, investment capacity, profession.

## Plan

### `src/components/modals/PremiumApplicationModal.tsx`
Add the following fields to the form (in this order, after existing description textarea):

1. **Current Broker** — text input ("Which broker are you currently trading with?")
2. **Investment Capacity** — select dropdown
   - Under $500
   - $500 – $2,000
   - $2,000 – $10,000
   - $10,000 – $50,000
   - $50,000+
3. **Profession / What you do for a living** — text input
4. **Preferred Communication Method** — select dropdown
   - Telegram
   - WhatsApp
   - Email
   - Phone Call

### Dropdown visibility fix
Current `inputClass` uses `bg-[rgba(255,255,255,0.04)]` which inherits the page's near-white default `<option>` styling on dark theme. Fix by:
- Adding explicit `bg-card text-foreground` to the `<select>` elements (overrides browser default option list background on most browsers)
- Adding `className="bg-card text-foreground"` to each `<option>` so the dropdown list items also render with proper contrast in dark theme

### Submit handler
Keep the local-only submit (no DB persistence — modal is currently demo only, matching existing behavior). All new fields will be `required` except they'll just collect into the form state and show the success screen.

### Files touched
- `src/components/modals/PremiumApplicationModal.tsx` — only file changed

### Out of scope
- Persisting applications to a Supabase table (current modal is fire-and-forget)
- Email/Telegram notification on submit
- Validation library (zod) — sticks with native `required` for consistency with existing form

