

# Fix: Date Format Text Size in Users & Roles Table

## Problem
Table এ DD-MM-YY date গুলো এখনও ছোট text এ দেখাচ্ছে। বড় ও bold করতে হবে।

## Changes — `src/pages/admin/UsersAdmin.tsx`

### Table Date Cell (line 228)
- `text-muted-foreground` থেকে → `text-sm font-semibold text-foreground` করবো
- Date value গুলো আর ছোট/ফ্যাকাশে লাগবে না

### "FROM:" / "TO:" Labels
- AdminTableToolbar এ already `text-base font-semibold uppercase` আছে — code ঠিক আছে
- Build refresh এর পরে দেখা যাবে

### Files: 1
| File | Change |
|------|--------|
| `src/pages/admin/UsersAdmin.tsx` | Date cell font বড় ও bold করবো |

