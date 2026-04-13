

# Plan: Assign Super Admin Role to gogang735@gmail.com

## Steps

1. **Create the user account** — Sign up gogang735@gmail.com with password `Fugazi@06fx` via Supabase Auth (if not already registered).

2. **Assign super_admin role** — Look up the user's UUID from `auth.users`, then insert a row into `user_roles` table with `role = 'super_admin'`.

This requires:
- Using `supabase` client or SQL to check/create the user
- Using the database insert tool to add the role entry

## Technical Detail

```sql
-- Find user ID
SELECT id FROM auth.users WHERE email = 'gogang735@gmail.com';

-- Insert super_admin role
INSERT INTO public.user_roles (user_id, role) 
VALUES ('<user-id>', 'super_admin');
```

