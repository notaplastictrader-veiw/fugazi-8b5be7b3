UPDATE auth.users
SET email_confirmed_at = now()
WHERE email = 'ishaqzaade.im@gmail.com' AND email_confirmed_at IS NULL;