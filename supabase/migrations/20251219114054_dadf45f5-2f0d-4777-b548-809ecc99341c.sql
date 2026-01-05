-- Add GPS coordinates to office_locations for location-based selection
ALTER TABLE office_locations 
ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS radius_meters INTEGER DEFAULT 100;