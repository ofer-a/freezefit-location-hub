-- Fix gallery_images table - add image_data columns if they don't exist
-- This is a safe migration that checks if columns exist before adding them

-- Add image_data column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'gallery_images' 
        AND column_name = 'image_data'
    ) THEN
        ALTER TABLE gallery_images ADD COLUMN image_data BYTEA;
        RAISE NOTICE 'Added image_data column to gallery_images';
    ELSE
        RAISE NOTICE 'image_data column already exists in gallery_images';
    END IF;
END $$;

-- Add image_mime_type column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'gallery_images' 
        AND column_name = 'image_mime_type'
    ) THEN
        ALTER TABLE gallery_images ADD COLUMN image_mime_type VARCHAR(50);
        RAISE NOTICE 'Added image_mime_type column to gallery_images';
    ELSE
        RAISE NOTICE 'image_mime_type column already exists in gallery_images';
    END IF;
END $$;

-- Create index if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_indexes 
        WHERE indexname = 'idx_gallery_images_data'
    ) THEN
        CREATE INDEX idx_gallery_images_data ON gallery_images(id) WHERE image_data IS NOT NULL;
        RAISE NOTICE 'Created index idx_gallery_images_data';
    ELSE
        RAISE NOTICE 'Index idx_gallery_images_data already exists';
    END IF;
END $$;

-- Verify the fix
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'gallery_images'
ORDER BY ordinal_position;

