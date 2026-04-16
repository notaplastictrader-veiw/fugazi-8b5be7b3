

# Fix: Applications Link Missing from Admin Sidebar

## সমস্যা
`/admin/applications` page আছে এবং route ও আছে, কিন্তু Admin Sidebar এ এটার link নেই। তাই super admin হিসেবে navigate করার উপায় নেই।

## সমাধান

### `src/components/admin/AdminSidebar.tsx`
Sidebar এর appropriate section এ (likely "OVERVIEW" বা "PROVIDER MANAGEMENT" section) একটা নতুন menu item add করবো:

```typescript
{ title: "Applications", url: "/admin/applications", icon: UserPlus }
```

`UserPlus` icon already import list এ আছে কিনা check করবো, না থাকলে add করবো।

## Files Changed

| File | Change |
|------|--------|
| `src/components/admin/AdminSidebar.tsx` | Add "Applications" menu item with `UserPlus` icon to sidebar |

