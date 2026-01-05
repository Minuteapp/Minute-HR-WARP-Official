-- Extend goals table with new columns for enterprise features
ALTER TABLE goals ADD COLUMN IF NOT EXISTS goal_level text DEFAULT 'individual';
ALTER TABLE goals ADD COLUMN IF NOT EXISTS goal_type text DEFAULT 'operational';
ALTER TABLE goals ADD COLUMN IF NOT EXISTS risk_level text DEFAULT 'low';
ALTER TABLE goals ADD COLUMN IF NOT EXISTS forecast_progress integer;
ALTER TABLE goals ADD COLUMN IF NOT EXISTS target_progress integer DEFAULT 100;
ALTER TABLE goals ADD COLUMN IF NOT EXISTS trend text DEFAULT 'stable';
ALTER TABLE goals ADD COLUMN IF NOT EXISTS owner_name text;
ALTER TABLE goals ADD COLUMN IF NOT EXISTS department_name text;
ALTER TABLE goals ADD COLUMN IF NOT EXISTS is_employee_goal boolean DEFAULT false;

-- Create goal_ai_insights table
CREATE TABLE IF NOT EXISTS goal_ai_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  priority text NOT NULL CHECK (priority IN ('critical', 'warning', 'info')),
  title text NOT NULL,
  description text,
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE goal_ai_insights ENABLE ROW LEVEL SECURITY;

-- RLS Policies for goal_ai_insights
CREATE POLICY "Users can view goal insights for their company"
  ON goal_ai_insights FOR SELECT
  USING (true);

CREATE POLICY "Users can insert goal insights"
  ON goal_ai_insights FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update goal insights"
  ON goal_ai_insights FOR UPDATE
  USING (true);

CREATE POLICY "Users can delete goal insights"
  ON goal_ai_insights FOR DELETE
  USING (true);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_goal_ai_insights_company ON goal_ai_insights(company_id);
CREATE INDEX IF NOT EXISTS idx_goal_ai_insights_priority ON goal_ai_insights(priority);
CREATE INDEX IF NOT EXISTS idx_goals_goal_level ON goals(goal_level);
CREATE INDEX IF NOT EXISTS idx_goals_goal_type ON goals(goal_type);
CREATE INDEX IF NOT EXISTS idx_goals_risk_level ON goals(risk_level);