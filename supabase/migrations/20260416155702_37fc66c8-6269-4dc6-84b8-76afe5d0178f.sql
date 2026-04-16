INSERT INTO public.profiles (user_id, full_name, phone, country, country_code)
SELECT 
  u.id,
  u.raw_user_meta_data ->> 'full_name',
  u.raw_user_meta_data ->> 'phone',
  u.raw_user_meta_data ->> 'country_name',
  u.raw_user_meta_data ->> 'country'
FROM auth.users u
LEFT JOIN public.profiles p ON p.user_id = u.id
WHERE p.user_id IS NULL;