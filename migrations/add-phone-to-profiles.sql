-- Add phone column to profiles table
-- This migration adds phone number support to user profiles

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone VARCHAR(20);

-- Create index for better performance on phone lookups
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON profiles(phone);

