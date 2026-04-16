

# UsersAdmin — Date Format DD-MM-YY, Uppercase Labels & Name

## Changes

### 1. `src/components/admin/AdminTableToolbar.tsx`
- "From:" ও "To:" labels বড় করবো — `text-sm` থেকে `text-base font-semibold uppercase` করবো

### 2. `src/pages/admin/UsersAdmin.tsx`
- **Date format DD-MM-YY** — সব জায়গায় `toLocaleDateString()` replace করবো custom formatter দিয়ে:
  ```ts
  const formatDate = (d: string) => {
    const date = new Date(d);
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yy = String(date.getFullYear()).slice(-2);
    return `${dd}-${mm}-${yy}`;
  };
  ```
- **Name uppercase** — table cell এ `uppercase` class add করবো: `"MD IMRAN HOSSAIN"` style এ দেখাবে
- **Phone** — already দেখাচ্ছে `profiles[r.user_id]?.phone`, তাই `+8801903572055` format এ আসবে যেমন DB তে আছে
- Export CSV তেও same DD-MM-YY format use করবো

### Files: 2
| File | Change |
|------|--------|
| `src/components/admin/AdminTableToolbar.tsx` | From/To labels বড় ও uppercase |
| `src/pages/admin/UsersAdmin.tsx` | Date → DD-MM-YY, Name → uppercase |

