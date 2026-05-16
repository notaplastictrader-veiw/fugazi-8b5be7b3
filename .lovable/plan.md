## Add ⓘ tooltip to each hero stat

Add a small info icon next to each stat number in `HeroSection.tsx`. On hover/tap, show an explanation tooltip using the existing shadcn `Tooltip` component.

### Changes

**File:** `src/components/sections/HeroSection.tsx`

1. Extend `defaultStats` to include a `tooltip` field:
   - `590+ Brokers & Firms` → "Includes all brokers and prop firms in our database, whether reviewed or not."
   - `50K+ Reviews Analyzed` → "We analyze public reviews from multiple sources, not just user submissions."
   - `140+ Countries Reached` → "Traders from 140+ countries access NAFT every month."
   - `1.2M+ Platform Views` → "Total page views across all NAFT properties, last quarter."

2. Import `Info` icon from `lucide-react` and `Tooltip`, `TooltipTrigger`, `TooltipContent`, `TooltipProvider` from `@/components/ui/tooltip`.

3. Inside each stat tile: render the number with a small `Info` icon (size 12, `text-muted-foreground/60`, hover `text-primary`) right next to the value. Wrap it in a Tooltip; content shows the explanation text (max-width ~220px, small font).

### Layout safety

- Keep tile structure unchanged (number on top centered, label single-line below, no dot).
- Icon sits inline beside the number with `gap-1.5`, doesn't push label to a new line.
- Use `whitespace-normal` on tooltip content only; label stays `whitespace-nowrap`.
- `TooltipProvider` wraps the stats grid only — doesn't affect the rest of the page.

### Confirm before I build

Should the **140+ Countries Reached** tooltip use my suggested copy, or do you want to provide your own line?
