-- Add therapist status support
-- This migration adds is_active status to therapists table

-- Add is_active column to therapists table
ALTER TABLE therapists ADD COLUMN is_active BOOLEAN DEFAULT true;
ALTER TABLE therapists ADD COLUMN deactivated_at TIMESTAMP WITH TIME ZONE;

-- Create index for better performance on active therapists queries
CREATE INDEX idx_therapists_is_active ON therapists(is_active) WHERE is_active = true;
CREATE INDEX idx_therapists_institute_active ON therapists(institute_id, is_active) WHERE is_active = true;

-- Update existing therapists to be active by default
UPDATE therapists SET is_active = true WHERE is_active IS NULL;
