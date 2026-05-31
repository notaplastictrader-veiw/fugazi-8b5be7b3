UPDATE storage.buckets
SET allowed_mime_types = NULL,
    file_size_limit = 52428800,
    public = true
WHERE id = 'media';