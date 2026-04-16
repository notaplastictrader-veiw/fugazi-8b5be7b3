

# UsersAdmin — Bulk CSV Import + User ID Display with Copy

## Changes — `src/pages/admin/UsersAdmin.tsx` only

### 1. User ID column with copy button
- Table এ নতুন "User ID" column add করবো (Name এর পরে)
- প্রতিটা row তে truncated UUID দেখাবে (প্রথম 8 char + `...`)
- পাশে একটা copy icon button থাকবে — click করলে full UUID clipboard এ copy হবে + toast "Copied!"

### 2. Bulk CSV Import
- Header area তে "Assign Role" button এর পাশে নতুন **"Bulk Import"** button add করবো (Upload icon সহ)
- Click করলে একটা Dialog open হবে:
  - CSV format instruction: `user_id,role` (one per line)
  - Sample download link — click করলে sample CSV download হবে
  - File input (`<input type="file" accept=".csv">`)
  - Preview table — CSV parse করে দেখাবে কতগুলো row আছে
  - "Import All" button — loop করে প্রতিটা row `user_roles` table এ insert করবে
  - Success/error count toast দেখাবে শেষে

### Technical Details
- CSV parsing: native `FileReader` + split by newline/comma — no library needed
- Each row insert: `supabase.from("user_roles").insert({ user_id, role })`
- Invalid rows skip করবে (empty user_id, invalid role)
- Copy: `navigator.clipboard.writeText(uuid)` use করবো

