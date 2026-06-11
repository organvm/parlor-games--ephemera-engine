-- Create buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('contribution-photos', 'contribution-photos', false, 2097152, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic']),
  ('content-packs', 'content-packs', false, 5242880, ARRAY['application/json'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Enable RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- RLS for contribution-photos
-- Contributor upload: any user can upload, path structure: session_id/user_id/filename
CREATE POLICY "Allow contributors to upload photos" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'contribution-photos' 
    AND auth.uid()::text = (string_to_array(name, '/'))[2]
  );

CREATE POLICY "Allow contributors to read own photos" ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'contribution-photos' 
    AND auth.uid()::text = (string_to_array(name, '/'))[2]
  );

CREATE POLICY "Allow host to read session photos" ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'contribution-photos'
    AND EXISTS (
        SELECT 1 FROM sessions s
        WHERE s.id::text = (string_to_array(name, '/'))[1]
        AND s.host_id = auth.uid()
    )
  );

-- RLS for content-packs
-- Users can read pack if they own it or if it is bundled
CREATE POLICY "Allow users to read owned packs" ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'content-packs'
    AND (
        EXISTS (
            SELECT 1 FROM user_content_packs ucp
            WHERE ucp.user_id = auth.uid()
            AND ucp.pack_id = (string_to_array(name, '/'))[1]
        )
        OR EXISTS (
            SELECT 1 FROM content_packs cp
            WHERE cp.id = (string_to_array(name, '/'))[1]
            AND cp.is_bundled = true
        )
    )
  );
