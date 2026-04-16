

# Fix Dashboard Footer Overlap

## সমস্যা
Dashboard এ sidebar fixed/sticky থাকে, কিন্তু Footer full-width render হয় MainLayout এর মধ্যে। ফলে Footer এর বাম দিকের content sidebar এর নিচে চলে যায় — logo, text কাটা পড়ে।

## সমাধান
Dashboard pages এ Footer দেখানোর দরকার নেই — dashboard এর নিজস্ব "Back to Site" navigation আছে sidebar এ। 

**MainLayout.tsx** এ change: `/dashboard` route এ থাকলে Footer hide করবো।

```tsx
const isDashboard = pathSegments[0] === "dashboard";
// ...
{!isDashboard && <Footer />}
```

এতে dashboard pages এ footer আর দেখাবে না, sidebar overlap problem solve হবে, এবং অন্য সব page এ footer আগের মতোই থাকবে।

## Files Changed

| File | Change |
|------|--------|
| `src/components/layout/MainLayout.tsx` | Hide Footer when route starts with `/dashboard` |

