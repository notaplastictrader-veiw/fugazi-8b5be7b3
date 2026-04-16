

# Fix: "Full Review" Link Always Visible

## সমস্যা
"Full review" link শুধু hover করলে দেখায় (`opacity-0 group-hover:opacity-100`)। সবসময় visible হওয়া দরকার।

## সমাধান
`src/components/sections/BrokerTrustHub.tsx` এ দুটি জায়গায় `opacity-0 group-hover:opacity-100 transition-opacity` class remove করবো:

| Line | Current | New |
|------|---------|-----|
| ~100 | `opacity-0 group-hover:opacity-100 transition-opacity` | (removed) |
| ~181 | `opacity-0 group-hover:opacity-100 transition-opacity` | (removed) |

## File
`src/components/sections/BrokerTrustHub.tsx` — 2 line changes

