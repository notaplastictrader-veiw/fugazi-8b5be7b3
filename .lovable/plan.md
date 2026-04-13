

# Fix: Compare Page Loses First Broker on 2nd Selection

## Problem
Session replay confirms: selecting Quotex then IC Markets results in URL `/compare?b=ic-markets` instead of `/compare?b=quotex&b=ic-markets`. The first broker is lost.

## Root Cause
Stale closure in `addBroker`. The function captures `selected` at render time. When Radix Select fires `onValueChange`, it may use a stale closure where `selected` is still `[]` (before the initialization effect's state update propagated), so `[...selected, id]` produces only `[id]`.

## Fix (1 file: `src/pages/Compare.tsx`)

1. **Use functional state update** in `addBroker` and `removeBroker` to always read the latest `selected`:
   ```js
   const addBroker = (id: string) => {
     setSelected(prev => {
       if (prev.includes(id) || prev.length >= 4) return prev;
       return [...prev, id];
     });
     selectKeyRef.current += 1;
   };
   ```

2. **Sync URL via `useEffect`** instead of calling `updateUrl` manually — ensures URL always matches state:
   ```js
   useEffect(() => {
     if (!initializedRef.current || !allBrokers.length) return;
     updateUrl(selected);
   }, [selected]);
   ```

3. Remove manual `updateUrl(next)` calls from `addBroker` and `removeBroker`.

## Bonus Fix
Console shows `forwardRef` warnings for `XIcon` in Footer and `TickerBar` in MainLayout. Will fix those too if the components are simple function components needing `forwardRef`.

