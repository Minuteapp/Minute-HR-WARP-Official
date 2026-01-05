
-- Create time_entries table if it doesn't exist
CREATE TABLE IF NOT EXISTS time_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending', 'completed', 'cancelled')),
  project TEXT,
  location TEXT NOT NULL,
  note TEXT,
  break_minutes INTEGER DEFAULT 0,
  office_location_id UUID,
  department TEXT,
  category TEXT,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign key constraint to users table
ALTER TABLE time_entries 
ADD CONSTRAINT fk_time_entries_user_id 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_time_entries_user_id ON time_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_start_time ON time_entries(start_time);
CREATE INDEX IF NOT EXISTS idx_time_entries_status ON time_entries(status);
CREATE INDEX IF NOT EXISTS idx_time_entries_user_date ON time_entries(user_id, start_time);

-- Enable Row Level Security
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can only see their own time entries
CREATE POLICY "Users can view own time entries" ON time_entries
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own time entries
CREATE POLICY "Users can insert own time entries" ON time_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own time entries
CREATE POLICY "Users can update own time entries" ON time_entries
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own time entries
CREATE POLICY "Users can delete own time entries" ON time_entries
  FOR DELETE USING (auth.uid() = user_id);

-- Superadmins can manage all time entries
CREATE POLICY "Superadmins can manage all time entries" ON time_entries
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'superadmin'
    )
  );

-- Create trigger for updating updated_at timestamp
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_timestamp_time_entries
  BEFORE UPDATE ON time_entries
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_timestamp();

-- Add table to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE time_entries;

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON time_entries TO authenticated;
GRANT USAGE ON SEQUENCE time_entries_id_seq TO authenticated;
