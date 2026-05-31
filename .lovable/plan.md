## Plan: Adjust Vite Chunk Size Warning Limit

### What
Add `build.chunkSizeWarningLimit` to `vite.config.ts` to suppress or raise the Vite build warning about large JavaScript chunks.

### Why
The project bundles many heavy libraries (Recharts, jsPDF, react-markdown, Radix UI primitives, etc.). This regularly pushes chunk sizes past Vite’s default 500 KB warning threshold during production builds, producing noisy but non-actionable warnings.

### How
In `vite.config.ts`, add a `build` object with `chunkSizeWarningLimit` set to **1500** (1.5 MB). This keeps the warning meaningful for truly oversized chunks while allowing the current dependency set to build cleanly.

```
vite.config.ts
  + build: {
  +   chunkSizeWarningLimit: 1500,
  + },
```

No other configuration changes required.