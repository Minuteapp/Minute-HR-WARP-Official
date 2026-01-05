-- Erweitere business_trips Tabelle
ALTER TABLE business_trips ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'normal';
ALTER TABLE business_trips ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'pending';
ALTER TABLE business_trips ADD COLUMN IF NOT EXISTS approved_by TEXT;
ALTER TABLE business_trips ADD COLUMN IF NOT EXISTS trip_number TEXT;
ALTER TABLE business_trips ADD COLUMN IF NOT EXISTS timezone TEXT;

-- Erweitere trip_hotels Tabelle
ALTER TABLE trip_hotels ADD COLUMN IF NOT EXISTS check_in_time TIME;
ALTER TABLE trip_hotels ADD COLUMN IF NOT EXISTS check_out_time TIME;
ALTER TABLE trip_hotels ADD COLUMN IF NOT EXISTS meal_plan TEXT;

-- Erweitere flight_details Tabelle
ALTER TABLE flight_details ADD COLUMN IF NOT EXISTS flight_class TEXT;
ALTER TABLE flight_details ADD COLUMN IF NOT EXISTS aircraft_type TEXT;
ALTER TABLE flight_details ADD COLUMN IF NOT EXISTS duration_minutes INTEGER;
ALTER TABLE flight_details ADD COLUMN IF NOT EXISTS departure_terminal TEXT;
ALTER TABLE flight_details ADD COLUMN IF NOT EXISTS departure_gate TEXT;
ALTER TABLE flight_details ADD COLUMN IF NOT EXISTS arrival_terminal TEXT;
ALTER TABLE flight_details ADD COLUMN IF NOT EXISTS arrival_gate TEXT;