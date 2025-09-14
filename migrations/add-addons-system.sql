-- Add addons system to services table
-- This allows services table to handle services, benefits, and products

-- Add type column to services table
ALTER TABLE services ADD COLUMN IF NOT EXISTS type VARCHAR(20) DEFAULT 'service' CHECK (type IN ('service', 'benefit', 'product'));

-- Add index for better performance when filtering by type
CREATE INDEX IF NOT EXISTS idx_services_type ON services(type);

-- Add index for institute_id and type combination
CREATE INDEX IF NOT EXISTS idx_services_institute_type ON services(institute_id, type);

-- Update existing services to have type 'service' (if they don't already have a type)
UPDATE services SET type = 'service' WHERE type IS NULL;
