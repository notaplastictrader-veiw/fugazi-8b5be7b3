

# Fix: Broker Join Section — Links & Contact Us Buttons

## সমস্যা
1. **"Promote Your Broker →"** button `/partnership` এ নিয়ে যায় — কিন্তু এটা Partnership page এর Affiliate tab এ যায়, broker listing এর জন্য relevant না
2. **Tier cards এর "Contact Us →" ও "Get Listed →"** buttons কোথাও connected না — শুধু `<button>` tag, কোনো link/action নেই

## সমাধান

### `src/components/sections/BrokerJoinSection.tsx`:

1. **"Promote Your Broker →"** link change: `/partnership` → `/advertise` (advertising page, broker promotion এর জন্য relevant)

2. **Tier card buttons কে functional করা:**
   - "Contact Us →" (Featured + Verified, Verified Partner) → `/advertise` page এ নিয়ে যাবে (form আছে already)
   - "Get Listed →" (Basic Listing) → `/broker-claim` page এ নিয়ে যাবে (claim profile flow)
   - `<button>` → `<a href="...">` বা `<Link>` এ change করবো

### Changes — 1 file only

| Line | Current | New |
|------|---------|-----|
| ~72 | `<a href="/partnership">` | `<a href="/advertise">` |
| ~91-93 | `<button>...</button>` | `<Link to={tier link}>...</Link>` with `/advertise` for Contact Us, `/broker-claim` for Get Listed |

