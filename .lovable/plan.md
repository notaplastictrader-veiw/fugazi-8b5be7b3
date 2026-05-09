## Change

`src/components/sections/TickerBar.tsx` — chip ta weekend e o "LIVE" (green) thakbe. Forex pairs er pashe already "CLOSED" badge ace, tai chip alada label er dorkar nai.

### Logic
- **Data ace** → `LIVE` (green pulse) — forex open hok ba close
- **Data nai / rate-limited** → `WAIT` (yellow)
- Tooltip e weekend hint thakbe: "Forex closed — crypto live. Reopens in Xd Yh"

### Code
Status simplify:
```ts
const status: "LIVE" | "WAIT" = showFallback ? "WAIT" : "LIVE";
```
`CRYPTO` branch remove. Tooltip forex_open er upor base kore weekend message dekhabe.

## Files
- `src/components/sections/TickerBar.tsx`
