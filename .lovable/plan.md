

# Fallback Broker Data কে Real DB Data তে রূপান্তর + BrokerDetail Page Fix

## সমস্যা
1. Homepage এর fallback brokers গুলো fake ID ("1", "2" etc.) দিয়ে আছে — DB তে নেই
2. "Full Review" click করলে `/brokers/exness` যায়, কিন্তু DB তে exness নেই তাই "Broker not found" দেখায়
3. BrokerDetail page শুধু DB থেকে fetch করে, fallback নেই

## সমাধান

### Step 1: Database এ Demo Brokers Insert করা (Migration)
`src/data/brokers.ts` এর সব brokers কে SQL migration দিয়ে `brokers` table এ `status = 'published'` হিসেবে insert করবো। এতে:
- Homepage DB থেকে real data পাবে (fallback লাগবে না)
- BrokerDetail page ও DB থেকে slug দিয়ে খুঁজে পাবে
- Full review page কাজ করবে

Brokers: Exness, IC Markets, XM Global, Quotex, Pepperstone, FTMO (+ বাকি যেগুলো `src/data/brokers.ts` তে আছে)

### Step 2: BrokerDetail এ Fallback Logic Add করা
DB তে broker না পেলে `src/data/brokers.ts` থেকে slug match করে fallback broker দেখাবে। এতে কোনো broker miss হলেও page কাজ করবে।

## Files Changed

| File | Change |
|------|--------|
| SQL Migration | Insert all demo brokers into `brokers` table with `status = 'published'` |
| `src/pages/BrokerDetail.tsx` | Add fallback from `src/data/brokers.ts` when DB returns null |

