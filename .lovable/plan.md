

# Unify Everything into Approval Queue (`/admin/approvals`)

## সমস্যা
1. Notification link `/admin/applications` এ যাচ্ছে — `/admin/approvals` এ যাওয়া উচিত
2. Dashboard এ quick actions আলাদা আলাদা link দেখাচ্ছে (`/admin/applications`, `/admin/claims`, `/admin/tier-upgrades`) — সব `/admin/approvals` এ যাওয়া উচিত
3. Sidebar এ "Applications" আলাদা link আছে — দরকার নেই, Approval Queue তেই সব আছে
4. Pending count এ শুধু `approval_queue` count যাচ্ছে — applications + claims + upgrades + content সব মিলিয়ে total pending দেখানো উচিত

## সমাধান

### 1. `src/components/modals/AuthModal.tsx`
- `notifyAdmins()` call এর link `/admin/applications` → `/admin/approvals` change

### 2. `src/lib/notifyAdmins.ts`
- Default link already `/admin/approvals` — no change needed

### 3. `src/pages/admin/Dashboard.tsx`
- **Primary stats "Pending"** value: `pendingApprovals + pendingApplications + pendingClaims + pendingUpgrades` (total pending across all)
- **Quick actions** consolidate: Remove separate Applications/Claims/Upgrades entries. Keep one "Approval Queue" with total pending badge. Link → `/admin/approvals`

### 4. `src/components/admin/AdminSidebar.tsx`
- Remove the "Applications" menu item (it's redundant, everything is in Approval Queue)

### 5. `src/pages/BrokerClaimProfile.tsx`
- Verify `notifyAdmins` link is `/admin/approvals` (it uses default, so already correct)

## Files Changed

| File | Change |
|------|--------|
| `src/components/modals/AuthModal.tsx` | Fix notifyAdmins link to `/admin/approvals` |
| `src/pages/admin/Dashboard.tsx` | Combine all pending counts, consolidate quick actions to single Approval Queue link |
| `src/components/admin/AdminSidebar.tsx` | Remove "Applications" menu item |

