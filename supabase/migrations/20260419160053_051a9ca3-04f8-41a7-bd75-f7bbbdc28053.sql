-- Allow admins/moderators to manage review avatar uploads in avatars/reviews/
CREATE POLICY "Admins can upload review avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = 'reviews'
  AND (public.has_role('super_admin') OR public.has_role('content_ops') OR public.has_role('moderator'))
);

CREATE POLICY "Admins can update review avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = 'reviews'
  AND (public.has_role('super_admin') OR public.has_role('content_ops') OR public.has_role('moderator'))
);

CREATE POLICY "Admins can delete review avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = 'reviews'
  AND (public.has_role('super_admin') OR public.has_role('content_ops') OR public.has_role('moderator'))
);