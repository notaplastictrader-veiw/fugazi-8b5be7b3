

# Search Bar Typewriter Placeholder Animation

## What You Want
Search bar এর ভেতরে placeholder text একটা typewriter effect এ — একটা একটা character লিখবে, তারপর মুছে ফেলবে (reverse), তারপর নতুন text লিখবে। Multiple placeholder texts cycle করবে।

## How It Works

Multiple placeholder texts rotate করবে typewriter style:
1. "Search Brokers..." → type letter by letter
2. Pause briefly
3. Delete letter by letter (reverse)
4. "Search Prop Firms..." → type letter by letter
5. Repeat

### Placeholder texts to cycle:
- `Search Brokers...`
- `Search Prop Firms...`
- `Search Signal Providers...`
- `Search Crypto Exchanges...`
- `Search Scam Alerts...`

## Technical Plan

### File: `src/components/sections/HeroSection.tsx`

1. **Add typewriter state & effect** — `useState` for `displayText`, `useEffect` that types/deletes characters with `setTimeout`
2. **Replace static `placeholder`** — Use the animated text as a custom overlay `<span>` positioned inside the search bar (since native `placeholder` can't animate per-character). When `searchValue` is empty, show the animated text; when user types, hide it.
3. **Blinking cursor** — Add a blinking `|` cursor after the animated text for authentic typewriter feel

### Approach
- Overlay a `<span>` with the typewriter text inside the search container (pointer-events-none)
- Hide it when `searchValue` is not empty
- Keep the native `placeholder` empty
- Typing speed: ~80ms per char, deleting speed: ~40ms, pause between words: ~1500ms

### Files Modified
- `src/components/sections/HeroSection.tsx` — Add typewriter hook + overlay span (~30 lines added)

