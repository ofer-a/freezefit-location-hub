-- Migration to add reschedule request fields to appointments table
-- This allows tracking of original and requested dates/times for reschedule requests

-- Add columns for reschedule tracking
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS original_date DATE;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS original_time TIME;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS requested_date DATE;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS requested_time TIME;

-- Add comment to explain the columns
COMMENT ON COLUMN appointments.original_date IS 'Original appointment date when reschedule is requested';
COMMENT ON COLUMN appointments.original_time IS 'Original appointment time when reschedule is requested';
COMMENT ON COLUMN appointments.requested_date IS 'Requested new appointment date';
COMMENT ON COLUMN appointments.requested_time IS 'Requested new appointment time';




