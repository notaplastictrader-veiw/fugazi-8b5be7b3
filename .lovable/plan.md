## Plan

1. **Stop homepage collapse from lazy chunks**
   - Split the homepage lazy sections so one failed section cannot unmount everything after it.
   - Wrap each lazy section with its own `Suspense` boundary instead of one shared boundary around all below-fold sections.
   - Keep `LazySection` reserved heights so mid-scroll loading does not jump the page.

2. **Clean risky JSX that can trigger stale lazy chunk issues**
   - Remove leftover no-op IIFE JSX in `ScamAlertSection`.
   - Keep pagination calculations as top-level constants, not inline IIFEs.

3. **Restore prop firm carousel behavior on homepage**
   - Ensure the Prop Firms section uses `CardCarousel` with `itemsPerView={6}` on desktop.
   - Keep swipe enabled on mobile/tablet and arrows/dots available when more than one slide exists.
   - Make sure fallback prop-firm data has at least 6 cards if live data is missing or only returns one prop firm.

4. **Make carousel responsive better for tab/mobile**
   - Update `CardCarousel` sizing so mobile shows 1 card, tablet shows 2 cards, desktop shows 6 cards.
   - Keep horizontal swipe smooth and stable without layout shifting.

5. **Verify after changes**
   - Check console for lazy chunk/runtime errors.
   - Confirm homepage scrolls past Signal/News/Forum without jumping to top.
   - Confirm Prop Firms shows 6 cards per desktop slide and swipe works on smaller screens.