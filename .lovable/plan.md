## Change

`src/pages/Education.tsx` — Premium Content section er heading area te ekta "UPCOMING" badge add korbo, jate users bujhe j courses ekhono setup hoyni.

### Location
Line ~175 er kasakasi, "PREMIUM CONTENT" badge er pashe ekta amber/coral "UPCOMING" badge add hobe. Subheading text o slightly update korbo: "Coming soon — structured courses and ebooks written by professional traders."

### Code
```tsx
<div className="flex items-center justify-center gap-2 mb-4">
  <span className="inline-block px-3 py-1 rounded-full text-xs font-mono font-semibold bg-accent/10 text-accent">
    PREMIUM CONTENT
  </span>
  <span className="inline-block px-3 py-1 rounded-full text-xs font-mono font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/30">
    UPCOMING
  </span>
</div>
```

Course cards er upor optionally ekta subtle "coming soon" overlay/disable o korte pari — but tumi bolso shudhu label, tai ami shudhu badge add korbo, cards visible thakbe.

## Files
- `src/pages/Education.tsx`
