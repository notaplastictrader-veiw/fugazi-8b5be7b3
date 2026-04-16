

# Unified Approval Queue + Admin Notifications

## কী করবো

### 1. ApprovalQueueAdmin.tsx — Complete Rewrite
একটা unified page যেখানে ৪টা source থেকে সব pending requests এক জায়গায় দেখাবে:

**Dropdown filter:** All | Applications | Profile Claims | Tier Upgrades | Content

প্রতিটা item দেখাবে:
- **কে** — নাম, ইমেইল, ফোন (profiles table join + application contact fields)
- **কী ধরনের** — Application / Claim / Upgrade / Content (color-coded badge)
- **কবে** — submission date + time in queue
- **Status** — pending / approved / rejected
- **Review button** → type-specific modal:
  - Application: company name, website, role, approve (creates profile + role) / reject
  - Claim: entity name, claimant details, docs link, approve / reject
  - Upgrade: current tier → requested tier, approve / reject
  - Content: existing approve/reject flow

Approve/reject logic প্রতিটা type এর জন্য existing handlers থেকে নেওয়া হবে (ApplicationsAdmin, BrokerClaimsAdmin, TierUpgradesAdmin এর logic merge করবো)।

### 2. Admin Notifications — Submit Time
যখন user request submit করে, super_admin দের কে notification পাঠাবে:

**BrokerClaimProfile.tsx** — claim submit এর পরে:
```
// Fetch super_admin user IDs, insert notification for each
```

**AuthModal.tsx** — application submit এর পরে:
```
// Same: notify super_admins about new application
```

Helper function তৈরি করবো `notifyAdmins(title, message, link)` — `user_roles` থেকে super_admin দের খুঁজে notifications insert করবে।

### 3. AdminSidebar.tsx — Cleanup
PEOPLE section থেকে remove:
- ~~Applications~~ (url: /admin/applications)
- ~~Profile Claims~~ (url: /admin/claims)  
- ~~Tier Upgrades~~ (url: /admin/tier-upgrades)

রাখবো শুধু: Users & Roles

Routes App.tsx এ রাখবো (backward compatibility), কিন্তু sidebar থেকে links সরাবো।

## Files Changed

| File | Change |
|------|--------|
| `src/pages/admin/ApprovalQueueAdmin.tsx` | Complete rewrite — unified view from 4 tables, type-specific review modals, merged approve/reject logic |
| `src/components/admin/AdminSidebar.tsx` | PEOPLE section থেকে 3 links remove |
| `src/lib/notifyAdmins.ts` | New helper — fetches super_admin IDs, inserts notifications |
| `src/pages/BrokerClaimProfile.tsx` | Claim submit এর পর `notifyAdmins()` call |
| `src/components/modals/AuthModal.tsx` | Application submit এর পর `notifyAdmins()` call |

No database migration needed.

