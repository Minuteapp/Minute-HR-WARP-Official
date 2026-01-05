-- Extend business_trips table
ALTER TABLE business_trips ADD COLUMN IF NOT EXISTS country TEXT;
ALTER TABLE business_trips ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE business_trips ADD COLUMN IF NOT EXISTS destination_image_url TEXT;
ALTER TABLE business_trips ADD COLUMN IF NOT EXISTS co2_emission NUMERIC DEFAULT 0;
ALTER TABLE business_trips ADD COLUMN IF NOT EXISTS duration_days INTEGER;
ALTER TABLE business_trips ADD COLUMN IF NOT EXISTS booking_reference TEXT;

-- Create trip_hotels table
CREATE TABLE IF NOT EXISTS trip_hotels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_trip_id UUID REFERENCES business_trips(id) ON DELETE CASCADE,
  hotel_name TEXT NOT NULL,
  hotel_rating INTEGER CHECK (hotel_rating >= 1 AND hotel_rating <= 5),
  address TEXT,
  phone TEXT,
  check_in TIMESTAMPTZ,
  check_out TIMESTAMPTZ,
  room_type TEXT,
  nights INTEGER,
  booking_reference TEXT,
  company_id UUID REFERENCES companies(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create trip_meeting_locations table
CREATE TABLE IF NOT EXISTS trip_meeting_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_trip_id UUID REFERENCES business_trips(id) ON DELETE CASCADE,
  location_name TEXT NOT NULL,
  address TEXT,
  stand_number TEXT,
  contact_person TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  company_id UUID REFERENCES companies(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create trip_agenda_items table
CREATE TABLE IF NOT EXISTS trip_agenda_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_trip_id UUID REFERENCES business_trips(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  agenda_date DATE NOT NULL,
  agenda_time TIME,
  location TEXT,
  is_completed BOOLEAN DEFAULT false,
  company_id UUID REFERENCES companies(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create trip_projects table
CREATE TABLE IF NOT EXISTS trip_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_trip_id UUID REFERENCES business_trips(id) ON DELETE CASCADE,
  project_id UUID,
  project_name TEXT NOT NULL,
  company_id UUID REFERENCES companies(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create trip_tasks table
CREATE TABLE IF NOT EXISTS trip_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_trip_id UUID REFERENCES business_trips(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  company_id UUID REFERENCES companies(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create system_activity_log table
CREATE TABLE IF NOT EXISTS system_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_type TEXT NOT NULL,
  activity_message TEXT NOT NULL,
  department TEXT,
  module TEXT DEFAULT 'business_travel',
  status_color TEXT DEFAULT 'green',
  company_id UUID REFERENCES companies(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all new tables
ALTER TABLE trip_hotels ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_meeting_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_agenda_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_activity_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for trip_hotels
CREATE POLICY "Users can view trip hotels" ON trip_hotels FOR SELECT USING (true);
CREATE POLICY "Users can insert trip hotels" ON trip_hotels FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update trip hotels" ON trip_hotels FOR UPDATE USING (true);
CREATE POLICY "Users can delete trip hotels" ON trip_hotels FOR DELETE USING (true);

-- RLS Policies for trip_meeting_locations
CREATE POLICY "Users can view trip meeting locations" ON trip_meeting_locations FOR SELECT USING (true);
CREATE POLICY "Users can insert trip meeting locations" ON trip_meeting_locations FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update trip meeting locations" ON trip_meeting_locations FOR UPDATE USING (true);
CREATE POLICY "Users can delete trip meeting locations" ON trip_meeting_locations FOR DELETE USING (true);

-- RLS Policies for trip_agenda_items
CREATE POLICY "Users can view trip agenda items" ON trip_agenda_items FOR SELECT USING (true);
CREATE POLICY "Users can insert trip agenda items" ON trip_agenda_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update trip agenda items" ON trip_agenda_items FOR UPDATE USING (true);
CREATE POLICY "Users can delete trip agenda items" ON trip_agenda_items FOR DELETE USING (true);

-- RLS Policies for trip_projects
CREATE POLICY "Users can view trip projects" ON trip_projects FOR SELECT USING (true);
CREATE POLICY "Users can insert trip projects" ON trip_projects FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update trip projects" ON trip_projects FOR UPDATE USING (true);
CREATE POLICY "Users can delete trip projects" ON trip_projects FOR DELETE USING (true);

-- RLS Policies for trip_tasks
CREATE POLICY "Users can view trip tasks" ON trip_tasks FOR SELECT USING (true);
CREATE POLICY "Users can insert trip tasks" ON trip_tasks FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update trip tasks" ON trip_tasks FOR UPDATE USING (true);
CREATE POLICY "Users can delete trip tasks" ON trip_tasks FOR DELETE USING (true);

-- RLS Policies for system_activity_log
CREATE POLICY "Users can view system activity log" ON system_activity_log FOR SELECT USING (true);
CREATE POLICY "Users can insert system activity log" ON system_activity_log FOR INSERT WITH CHECK (true);