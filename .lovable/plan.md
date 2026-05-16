# Plan: Configure Resend as email provider

## Security note
Please don't paste API keys in chat — they get stored in message history. I'll request it through the secure secret form instead, and you can rotate the key you just shared at https://resend.com/api-keys.

## Steps

1. **Add `RESEND_API_KEY`** via the secure secrets form (you'll paste it once into a masked input).

2. **Verify sender domain in Resend**
   - Resend requires a verified domain (or `onboarding@resend.dev` for testing only).
   - Question: which `from` address should we use?
     - `onboarding@resend.dev` (works immediately, testing only)
     - A custom domain you've already verified in Resend (e.g. `noreply@yourdomain.com`)

3. **Auth emails (signup confirmation, password reset, email verification, magic link)**
   - Scaffold a custom `auth-email-hook` edge function that sends via Resend API (using the gateway pattern).
   - Create branded React Email templates for: signup, recovery, magic-link, email-change.
   - Style templates with NAFT brand (lime/charcoal dark theme, DM Sans/Barlow Condensed fonts, white email body bg).
   - Register the hook with Supabase Auth so all auth emails route through Resend.

4. **Transactional emails (welcome, notifications, etc.)**
   - Create a `send-transactional-email` edge function calling Resend via the connector gateway pattern.
   - Add a "welcome email" trigger after signup (via the existing `handle_new_user` flow or a post-signup client call).
   - Provide a reusable helper for future transactional sends.

5. **Deploy** all new/updated edge functions.

## Technical details
- Use `https://api.resend.com/emails` directly with `Authorization: Bearer ${RESEND_API_KEY}` (simpler than the connector gateway since you're providing the key directly, not via OAuth connector).
- Templates live in `supabase/functions/_shared/email-templates/`.
- Auth hook: `supabase/functions/auth-email-hook/index.ts` with `verify_jwt = false` + webhook signature verification.
- Welcome email: triggered client-side after successful signup in `Signup.tsx`, or via DB webhook on profile insert.

## Open questions
1. Sender address — `onboarding@resend.dev` or your verified custom domain?
2. Welcome email — send immediately on signup, or after email verification?
