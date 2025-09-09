-- Add authentication fields to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
