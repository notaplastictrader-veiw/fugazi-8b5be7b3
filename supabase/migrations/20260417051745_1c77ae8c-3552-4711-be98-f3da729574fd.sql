-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('logos', 'logos', true, 2097152, ARRAY['image/png','image/jpeg','image/webp','image/svg+xml']),
  ('media', 'media', true, 5242880, ARRAY['image/png','image/jpeg','image/webp','image/gif']),
  ('avatars', 'avatars', true, 2097152, ARRAY['image/png','image/jpeg','image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Public read for all 3 buckets
CREATE POLICY "Public read logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'logos');

CREATE POLICY "Public read media"
ON storage.objects FOR SELECT
USING (bucket_id = 'media');

CREATE POLICY "Public read avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Admin write for logos + media
CREATE POLICY "Admins manage logos"
ON storage.objects FOR ALL TO authenticated
USING (bucket_id = 'logos' AND public.has_role('super_admin'::app_role))
WITH CHECK (bucket_id = 'logos' AND public.has_role('super_admin'::app_role));

CREATE POLICY "Admins manage media"
ON storage.objects FOR ALL TO authenticated
USING (bucket_id = 'media' AND public.has_role('super_admin'::app_role))
WITH CHECK (bucket_id = 'media' AND public.has_role('super_admin'::app_role));

-- Users manage own avatars (folder = auth.uid())
CREATE POLICY "Users upload own avatar"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users update own avatar"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users delete own avatar"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Schema additions
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS thumbnail_url text DEFAULT '';
ALTER TABLE public.education_articles ADD COLUMN IF NOT EXISTS hero_image_url text DEFAULT '';
ALTER TABLE public.signal_groups ADD COLUMN IF NOT EXISTS logo_url text DEFAULT '';