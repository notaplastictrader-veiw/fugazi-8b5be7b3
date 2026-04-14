

# Plan: 4 Fixes

## 1. Signal Groups — Add "View All" link + Fix "View Group" buttons

**Problem:** The homepage `SignalHub.tsx` has no "View All" link to `/signals`, and its "View Group" buttons are plain `<button>` without any link — they don't navigate anywhere.

**Fix:**
- `src/components/sections/SignalHub.tsx`: Add a "View All →" `<Link>` to `/signals` next to the section heading. Wrap each "View Group" button in a `<Link to={/signals/${group.id}}>`.
- `src/pages/Signals.tsx`: The cards already have working `<Link>` — no change needed there.

## 2. Prop Firms — Replace filter labels

**Problem:** The screenshot shows firm names (Bullwaves Prime, FTMO, etc.) as filter buttons. User wants category-based filters instead.

**Fix in `src/pages/PropFirms.tsx`:**
- Change the `filters` array from `["All", "Instant Funding", "Challenge-based", "Crypto Funded", "No Time Limit"]` to:
  `["All Prop Firms", "Instant Funding", "1-Step Challenge", "2-Step Challenge", "Discount Offers", "Crypto Funded", "No Time Limit"]`
- Update the `filterMap` accordingly with matching tag values.

## 3. Post Idea — Fix chart image upload

**Problem:** The "Chart Image" upload button in `PostIdeaModal.tsx` is a dummy `<button>` — it has no file input, so clicking does nothing.

**Fix in `src/components/ideas/PostIdeaModal.tsx`:**
- Add a hidden `<input type="file" accept="image/*">` with a ref.
- Wire the upload button's `onClick` to trigger the file input.
- Show a preview of the selected image and store it in state.

## Files to modify
- `src/components/sections/SignalHub.tsx` — Add "View All" link + wrap View Group in `<Link>`
- `src/pages/PropFirms.tsx` — Update filter labels
- `src/components/ideas/PostIdeaModal.tsx` — Add real file input for chart upload

