# Fix: Vercel-এ deep link 404 problem

## Problem
Live site `notafugazitrader.com` Vercel-এ host হচ্ছে। React Router (BrowserRouter) client-side routing করে, কিন্তু Vercel-এ SPA fallback configure করা নেই। তাই:

- Homepage থেকে navigate → ✅ কাজ করে
- Direct URL visit বা refresh (`/cookies`, `/disclaimer`, `/brokers/xyz`) → ❌ **404 NOT_FOUND** দেখায়

## Solution
Project root-এ `vercel.json` file create করব যেটা Vercel-কে বলবে সব unknown path `index.html`-এ rewrite করতে। React Router তখন proper page render করবে।

## File to create

**`vercel.json`** (root-এ):

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

## After implementation

1. File auto GitHub-এ push হবে (Lovable ↔ GitHub sync)
2. Vercel auto-rebuild trigger হবে (~1-2 min)
3. সব route কাজ করবে:
   - ✅ `/cookies` direct visit
   - ✅ `/disclaimer` refresh
   - ✅ `/brokers/exness` deep link
   - ✅ যেকোনো future route

## Verification
Deploy শেষ হলে browse করে check করব:
- `notafugazitrader.com/cookies` — Cookie Policy page load হয় কিনা
- `notafugazitrader.com/disclaimer` refresh — same page থাকে কিনা

## Notes
- এটা একটা single-file addition, কোনো existing code change হবে না
- Lovable hosting-এ এই file কোনো effect ফেলে না (Lovable নিজের SPA fallback ব্যবহার করে), তাই দুই hosting-ই কাজ করবে
- Performance বা SEO-তে কোনো negative impact নেই
