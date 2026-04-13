

# Plan: Change Account Password

Change the password for `gogang735@gmail.com` from the current password to `Fugazi@06fx`.

## Steps

1. Use the Supabase Admin API to update the user's password:
   ```js
   await supabase.auth.admin.updateUserById('1dff3a81-d2f7-40f5-8ead-33169a4665de', {
     password: 'Fugazi@06fx'
   })
   ```

Alternatively, you can do this manually from the **Supabase Dashboard → Authentication → Users → select the user → Update Password**.

## Files
No file changes needed — this is a one-time database operation via script.

