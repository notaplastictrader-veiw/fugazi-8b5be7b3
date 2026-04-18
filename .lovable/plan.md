

## Plan

### 1. Broker selection — make mandatory + auto-select
`ReviewSubmissionForm.tsx`:
- Add `defaultBrokerId?: string` prop. When passed, auto-select that broker and **hide** the dropdown (locked to that broker).
- When NOT passed (e.g. `/reviews` page), show dropdown but mark **required** (`*` label, validation rejects empty).
- Update `BrokerDetail.tsx` → pass `defaultBrokerId={broker.id}` to the form.

### 2. Reactions — WhatsApp-style picker
Refactor `ReviewReactions.tsx`:
- Replace the 4 always-visible buttons with **single trigger**: a smiley face icon (`SmilePlus` from lucide) + total count.
- Click trigger → opens `Popover` with full emoji palette in a grid.
- Expanded emoji set (good + bad + neutral): ❤️ 👍 👎 😂 😮 😢 😡 🔥 🙏 🤝 ⚠️ 💯 (12 reactions)
- Below the trigger, render small "summary chips" of reactions that already have ≥1 count (e.g. `❤️ 3  👍 5`) — clickable to toggle that reaction.
- Active reactions (user's own) show with primary ring.

### 3. Database — extend allowed reactions
Currently `review_reactions.reaction` is text with no constraint, but legacy code only used 4 keys (`love/care/helpful/thanks`). Switch to **emoji-as-key** storage (store the emoji char directly) — simpler, no enum migration, future-proof. No DB schema change needed since column is free-text.

Backward compatibility: when loading, map old keys (`love`→❤️, `care`→🤗, `helpful`→👍, `thanks`→🙏) to emoji on display.

### 4. Files to Touch
- `src/components/ReviewSubmissionForm.tsx` — add `defaultBrokerId` prop, hide/require broker field
- `src/pages/BrokerDetail.tsx` — pass `defaultBrokerId` to the form
- `src/pages/Reviews.tsx` (if exists) — keep dropdown required
- `src/components/reviews/ReviewReactions.tsx` — full rewrite with Popover picker + emoji palette + legacy mapping

### 5. Out of Scope
- Custom emoji uploads
- Reaction analytics in admin
- Limiting one reaction per user (users can stack multiple emojis if they want)
- Animated emoji picker (use simple grid)

