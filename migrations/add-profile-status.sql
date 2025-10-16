-- Add is_active and deactivated_at columns to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS deactivated_at TIMESTAMP WITH TIME ZONE;

-- Add indexes for better performance on active profiles
CREATE INDEX IF NOT EXISTS idx_profiles_is_active ON profiles(is_active);
CREATE INDEX IF NOT EXISTS idx_profiles_email_is_active ON profiles(email, is_active);

-- Set existing profiles to active
UPDATE profiles SET is_active = true WHERE is_active IS NULL;

