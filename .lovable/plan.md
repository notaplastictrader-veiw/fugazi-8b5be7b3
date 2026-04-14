

# Create Super Admin Account

## Steps

1. **Enable auto-confirm** for email signups (temporarily, for development) using `configure_auth`
2. **Sign up the user** programmatically via the Supabase auth API with:
   - Email: notaplastictrader@gmail.com
   - Password: Fuhazi@06fx
   - Name: Boss
3. **Insert `super_admin` role** into `user_roles` table for the new user
4. **Verify** the profile was auto-created by the `handle_new_user` trigger

This will give you full Super Admin access to the entire admin panel.

