-- Allow authenticated users to upload review photos into their own folder
CREATE POLICY "Users can upload own review photos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'media'
  AND (storage.foldername(name))[1] = 'reviews'
  AND (storage.foldername(name))[2] = auth.uid()::text
);

-- Allow authenticated users to update their own review photos
CREATE POLICY "Users can update own review photos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'media'
  AND (storage.foldername(name))[1] = 'reviews'
  AND (storage.foldername(name))[2] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'media'
  AND (storage.foldername(name))[1] = 'reviews'
  AND (storage.foldername(name))[2] = auth.uid()::text
);

-- Allow authenticated users to delete their own review photos
CREATE POLICY "Users can delete own review photos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'media'
  AND (storage.foldername(name))[1] = 'reviews'
  AND (storage.foldername(name))[2] = auth.uid()::text
);