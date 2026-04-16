

# Plan: Remove Global Settings + Add Full Review CRUD to Content Management

## What's Changing

### 1. Remove "Global Settings" page (duplicate)
The **Homepage Sections** page (SectionEditor) already provides proper form-based editing for every CMS key (hero, tickers, scam alerts, etc.). The **Global Settings** page shows the exact same data as raw JSON textareas — it's a duplicate.

**Changes:**
- Remove `Global Settings` link from `AdminSidebar.tsx` (line 47)
- Move the 2 ticker keys (`promo_ticker`, `ticker_pairs`) into SectionEditor so they're also editable via the Homepage Sections UI — currently SectionEditor has `promo-ticker` but not `ticker_pairs`
- Delete `SiteSettingsAdmin.tsx` (or keep as unused — your call)
- Remove the route for `/admin/settings` from App.tsx

### 2. Add full Review CRUD to ReviewsAdmin
Currently ReviewsAdmin only shows a table with Approve/Reject buttons. Missing: ability to **create**, **edit**, and **delete** reviews from admin.

**Add to `ReviewsAdmin.tsx`:**
- **Add Review** button → opens a modal/form with fields: Author, Rating (1-5), Content, Role, Status
- **Edit** button per row → opens same form pre-filled
- **Delete** button per row → confirmation then deletes
- Search/filter by author name
- View full content (currently truncated)

### 3. Add Ticker Pairs to SectionEditor
Add a `ticker-pairs` section config to SectionEditor so price ticker data is also editable from the Homepage Sections page (not just raw JSON).

```
"ticker-pairs": {
  title: "Ticker Pairs (Price Bar)",
  settingsKey: "ticker_pairs",
  fields: [
    { key: "items", type: "object-list", objectFields: [
      { key: "pair", label: "Pair", type: "text" },
      { key: "price", label: "Price", type: "text" },
      { key: "change", label: "Change", type: "text" },
      { key: "up", label: "Up (true/false)", type: "text" },
    ]}
  ]
}
```

Also add it to `SiteContentAdmin.tsx` sections list.

## Files Changed: 4
- `src/components/admin/AdminSidebar.tsx` — remove Global Settings link
- `src/pages/admin/SectionEditor.tsx` — add ticker-pairs config
- `src/pages/admin/SiteContentAdmin.tsx` — add Ticker Pairs card
- `src/pages/admin/ReviewsAdmin.tsx` — add Create, Edit, Delete functionality
- `src/App.tsx` — remove `/admin/settings` route

## No DB changes needed
Reviews table already has all required columns. Site settings table stays the same.

