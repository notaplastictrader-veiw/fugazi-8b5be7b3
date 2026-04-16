

# Scam Alert Detail Page + Story Field

## সমস্যা
Scam alert card এ click করলে কিছু হয় না। প্রতিটি alert এর জন্য একটি detail page দরকার যেখানে full story থাকবে (client যা লিখবে)।

## সমাধান

### Step 1: Database Migration — `story` column add
`scam_alerts` table এ `story TEXT` column add করবো। এখানে full detailed write-up রাখা যাবে। Demo alerts এ sample story text দিয়ে update করবো।

### Step 2: New Page — `src/pages/ScamAlertDetail.tsx`
`/scam-alerts/:id` route এ individual scam alert detail page:
- DB থেকে ID দিয়ে fetch
- Fallback data থেকে match (DB empty হলে)
- Title, severity badge, date, full story render
- Back link to `/scam-alerts`

### Step 3: Route Add — `src/App.tsx`
```
<Route path="/scam-alerts/:id" element={<ScamAlertDetail />} />
```

### Step 4: Card কে Clickable করা — `src/pages/ScamAlerts.tsx`
প্রতিটি card কে `<Link to={/scam-alerts/${alert.id}}>` দিয়ে wrap করবো।

### Step 5: Homepage Section ও Clickable — `src/components/sections/ScamAlertSection.tsx`
Homepage এর scam alert cards ও detail page এ link করবো।

## Files

| File | Change |
|------|--------|
| SQL Migration | `ALTER TABLE scam_alerts ADD COLUMN story TEXT`; update demo rows with sample stories |
| `src/pages/ScamAlertDetail.tsx` | New detail page |
| `src/App.tsx` | Add `/scam-alerts/:id` route |
| `src/pages/ScamAlerts.tsx` | Cards কে clickable Link করা |
| `src/components/sections/ScamAlertSection.tsx` | Cards কে clickable Link করা |

