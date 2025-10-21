-- Add therapist and institute details to appointments table
ALTER TABLE appointments
ADD COLUMN IF NOT EXISTS therapist_id UUID REFERENCES therapists(id),
ADD COLUMN IF NOT EXISTS therapist_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS institute_name VARCHAR(255);

-- Update existing appointments with therapist and institute names
UPDATE appointments
SET
  therapist_name = t.name,
  institute_name = i.institute_name
FROM therapists t, institutes i
WHERE appointments.therapist_id = t.id
  AND appointments.institute_id = i.id;

-- Make therapist_name and institute_name NOT NULL for future appointments
-- (existing records might have NULL values, so we'll handle this in the application)
