-- Add cover_art_url column to audio_files table
ALTER TABLE audio_files
ADD COLUMN cover_art_url TEXT;
