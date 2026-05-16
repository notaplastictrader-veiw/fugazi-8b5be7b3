## Goal
Update the default "from" name in the `send-email` edge function from **NAFT** to **NAFT Notify**.

## Change
In `supabase/functions/send-email/index.ts` (line 7):

Before:
```ts
const DEFAULT_FROM = Deno.env.get('RESEND_FROM') ?? 'NAFT <onboarding@resend.dev>';
```

After:
```ts
const DEFAULT_FROM = Deno.env.get('RESEND_FROM') ?? 'NAFT Notify <onboarding@resend.dev>';
```

## Verify
- Redeploy `send-email` edge function (auto).
- Send a test email to your admin address; inbox should show sender as **NAFT Notify**.

## Notes
- Email address stays `onboarding@resend.dev` until your custom domain is verified on Resend.
- No other files / DB changes needed.
