
-- Create the medical-docs bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('medical-docs', 'medical-docs', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing specific policies if they exist to avoid duplication
DROP POLICY IF EXISTS "Public Access Medical Docs" ON storage.objects;
DROP POLICY IF EXISTS "Auth Upload Medical Docs" ON storage.objects;

-- Allow public access to view the files
CREATE POLICY "Public Access Medical Docs" ON storage.objects FOR SELECT USING (bucket_id = 'medical-docs');

-- Allow authenticated users to upload their own files
CREATE POLICY "Auth Upload Medical Docs" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'medical-docs');

