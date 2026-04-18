

## What you're asking
When user picks a communication method, dynamically ask for the matching contact detail (WhatsApp number / Telegram link / Email). If the user is logged in, prefill from their profile so they don't re-type.

## Plan

### `src/components/modals/PremiumApplicationModal.tsx`

1. **Track method in state** — add `const [method, setMethod] = useState("")` and bind to the Preferred Communication Method `<select>` via `value` + `onChange`.

2. **Conditional contact field** rendered right below the method dropdown:
   - `telegram` → text input "Telegram username or t.me/ link" (placeholder `@yourhandle or https://t.me/yourhandle`)
   - `whatsapp` → tel input "WhatsApp number with country code" (placeholder `+8801XXXXXXXXX`)
   - `email` → email input "Email address"
   - `phone` → tel input "Phone number with country code"
   - All `required` when visible.

3. **Prefill from logged-in user**:
   - Pull `useAuth()` for `user`.
   - On mount (when modal opens), query `profiles` table for `email`, `phone`, `full_name`, `country` for `user.id`.
   - Prefill: Full Name, Country (existing fields) + the conditional contact field once method is chosen (if `email` → use `profiles.email || user.email`; if `whatsapp`/`phone` → use `profiles.phone`).
   - Telegram has no profile field today → leave blank (user types it).

4. **Logged-in hint**: small muted text under the method field "Prefilled from your profile — edit if needed" only when prefill happened.

5. **No new DB schema** — uses existing `profiles` table fields (`full_name`, `email`, `phone`, `country`).

### Files touched
- `src/components/modals/PremiumApplicationModal.tsx` only

### Out of scope
- Saving the application to DB (modal stays demo-only as before)
- Adding `telegram_handle` to the `profiles` table
- Validating Telegram link format / WhatsApp number format beyond `type=tel`/`type=email` browser checks

