

# Search Bar — Full Sentence Swap (No Typewriter)

## তুমি যা চাও
Letter-by-letter type/delete বাদ। পুরো sentence একবারে দেখাবে, তারপর fade out করে পরের sentence আসবে। ৩টা sentence ৩ বার cycle করবে।

## Technical Plan

### File: `src/components/sections/HeroSection.tsx`

1. **Remove typewriter logic** — `typewriterRef`, `displayText` state, এবং typewriter `useEffect` (lines 38, 40, 65-90) বাদ দাও
2. **Add simple text rotation** — `useState` দিয়ে `textIndex` track করো, `setInterval` দিয়ে প্রতি ~3 সেকেন্ডে next sentence এ switch করো with fade animation
3. **Update the overlay `<span>`** — `displayText` এর বদলে `typewriterTexts[textIndex]` দেখাবে, CSS transition দিয়ে fade-in/fade-out effect
4. **Keep blinking cursor** — cursor থাকবে sentence এর শেষে

### Animation
- Sentence দেখাবে 2.5s → fade out 300ms → next sentence fade in 300ms → repeat

### Files Modified
- `src/components/sections/HeroSection.tsx` — Simplify animation logic (~15 lines changed)

