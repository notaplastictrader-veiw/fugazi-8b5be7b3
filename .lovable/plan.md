

# Existing Account এ সব Role Assign করা

তোমার `notaplastictrader@gmail.com` (user ID: `c80732d4-4a9b-49bb-8f33-c9a4754554b9`) account এ ইতিমধ্যে `super_admin` role আছে। বাকি সব role গুলো add করবো।

## Steps

1. **Insert remaining roles** into `user_roles` table for user `c80732d4-4a9b-49bb-8f33-c9a4754554b9`:
   - `content_ops`
   - `moderator`
   - `broker`
   - `signal_provider`
   - `betting_site`

   Single SQL insert via the data insert tool.

2. **Verify** all 6 roles are assigned by querying `user_roles`.

This will give you access to every dashboard and admin section in the platform.

