-- Test Migration: GitHub Actions Deployment Test
-- Created: 2026-01-05 19:35:00
-- Purpose: Verify automatic deployment from GitHub to Supabase works

-- This is a harmless test that adds a comment to the database
-- It will not modify any data or schema

COMMENT ON SCHEMA public IS 'GitHub Actions deployment test - 2026-01-05 19:35';

-- Log that this migration ran successfully
DO $$
BEGIN
  RAISE NOTICE 'GitHub Actions deployment test migration executed successfully at %', NOW();
END $$;
