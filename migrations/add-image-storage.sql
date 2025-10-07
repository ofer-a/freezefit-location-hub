-- Add image storage support to existing tables
-- This migration adds binary image data storage to existing tables

-- Add image_data column to profiles table for profile images
ALTER TABLE profiles ADD COLUMN image_data BYTEA;
ALTER TABLE profiles ADD COLUMN image_mime_type VARCHAR(50);

-- Add image_data column to therapists table for therapist images  
ALTER TABLE therapists ADD COLUMN image_data BYTEA;
ALTER TABLE therapists ADD COLUMN image_mime_type VARCHAR(50);

-- Add image_data column to gallery_images table for gallery images
ALTER TABLE gallery_images ADD COLUMN image_data BYTEA;
ALTER TABLE gallery_images ADD COLUMN image_mime_type VARCHAR(50);

-- Add image_data column to institutes table for institute images
ALTER TABLE institutes ADD COLUMN image_data BYTEA;
ALTER TABLE institutes ADD COLUMN image_mime_type VARCHAR(50);

-- Create index for better performance on image queries
CREATE INDEX idx_profiles_image_data ON profiles(id) WHERE image_data IS NOT NULL;
CREATE INDEX idx_therapists_image_data ON therapists(id) WHERE image_data IS NOT NULL;
CREATE INDEX idx_gallery_images_data ON gallery_images(id) WHERE image_data IS NOT NULL;
CREATE INDEX idx_institutes_image_data ON institutes(id) WHERE image_data IS NOT NULL;
