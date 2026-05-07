## Goal
On the homepage, add 4 role-based "Join" buttons that open the existing AuthModal directly on the **Signup** view with the correct role tab preselected (still switchable). Extend the existing `BrokerJoinSection` — no new section.

## Why this is safe
- The role tab is a UI hint only. Real role assignment is server-side:
  - `user` (Trader) is auto-granted on signup.
  - `broker`, `signal_provider`, `betting_site` create an **application** that an admin must approve before the role lands in `user_roles`.
  - `admin` roles are never assignable from signup.
- RLS uses `has_role()` SECURITY DEFINER, so a manipulated client tab can't escalate privileges.
- Net effect: zero new attack surface vs. the existing signup modal.

## Changes

### 1. `src/components/modals/AuthModal.tsx`
- Add optional prop `defaultRole?: SignupRole` to `AuthModalProps`.
- In the `open` effect (line ~69), when `open` flips true: if `defaultRole` is provided → set `tab = "signup"` and `setSignupRole(defaultRole)`. Otherwise keep current behavior.
- No other logic changes — tab strip stays switchable.

### 2. `src/components/sections/BrokerJoinSection.tsx`
- Import `AuthModal`, `useState`, and 4 lucide icons (`User`, `Radio`, `Building2`, `Trophy`).
- Add local state: `authOpen: boolean`, `authRole: SignupRole | undefined`.
- Add a new "Join the network" sub-block **above the existing tiers grid** (or as a 4th row in the right column on lg, full-width on mobile) with 4 cards:
  - **Join as Trader** — `user` — "Review brokers, share experience"
  - **Join as Signal Provider** — `signal_provider` — "List your channel, reach traders"
  - **List Your Brokerage** — `broker` — "Claim or list your firm"
  - **List Your Sportsbook** — `betting_site` — "List your betting site"
- Each card click → `setAuthRole(role); setAuthOpen(true)`.
- Render `<AuthModal open={authOpen} onClose={() => setAuthOpen(false)} defaultTab="signup" defaultRole={authRole} />` at the bottom.
- Keep all existing CMS-driven content (title, tiers, claim link, footer note) untouched.

### 3. Styling
- Use existing `glass-card`, `text-foreground`, `text-muted-foreground`, `bg-primary/10`, `border-primary/20` semantic tokens.
- 4-up grid on `md+`, 2-up on `sm`, stacked on mobile.
- Each card: icon chip + bold title (Barlow Condensed via `font-display`) + 1-line muted description + small "Join →" arrow.

## Files NOT touched
- `Navbar.tsx`, `ScamAlerts.tsx` AuthModal usages — unchanged (they don't pass `defaultRole`, so behavior is identical).
- `Login.tsx`, signup logic, RLS, DB — no changes.
- Approval queue / application flow — already correct.

## Out of scope
- Locking the tab once preselected (user opted for switchable).
- New dedicated section, hero strip, or navbar entries.
- Any backend/role/RLS change.
