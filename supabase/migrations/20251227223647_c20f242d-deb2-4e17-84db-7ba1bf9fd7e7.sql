-- Add onboarding completion tracking to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS has_completed_onboarding BOOLEAN DEFAULT false;

-- Add comment for documentation
COMMENT ON COLUMN profiles.has_completed_onboarding IS 'Tracks whether user has completed the initial onboarding wizard';