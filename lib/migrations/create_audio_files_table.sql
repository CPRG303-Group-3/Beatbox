-- Create audio_files table
CREATE TABLE audio_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  filename TEXT NOT NULL,
  title TEXT,
  artist TEXT,
  duration NUMERIC,
  file_path TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create policy for row-level security
CREATE POLICY "Users can only access their own audio files"
  ON audio_files
  FOR ALL
  USING (auth.uid() = user_id);

-- Enable row-level security
ALTER TABLE audio_files ENABLE ROW LEVEL SECURITY;

-- Create storage bucket for audio files
-- Note: Run this in the SQL editor in the Supabase dashboard
-- or use the Supabase dashboard UI to create the bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('audio_files', 'audio_files', false);

-- Set up storage policy to allow authenticated users to upload files
CREATE POLICY "Allow users to upload their own audio files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'audio_files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Set up storage policy to allow users to read their own files
CREATE POLICY "Allow users to read their own audio files"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'audio_files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Set up storage policy to allow users to update their own files
CREATE POLICY "Allow users to update their own audio files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'audio_files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Set up storage policy to allow users to delete their own files
CREATE POLICY "Allow users to delete their own audio files"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'audio_files' AND auth.uid()::text = (storage.foldername(name))[1]);
