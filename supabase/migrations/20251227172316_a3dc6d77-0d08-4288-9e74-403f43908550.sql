-- Erweitere global_mobility_requests um zusätzliche Felder
ALTER TABLE global_mobility_requests ADD COLUMN IF NOT EXISTS employee_name text;
ALTER TABLE global_mobility_requests ADD COLUMN IF NOT EXISTS employee_role text;
ALTER TABLE global_mobility_requests ADD COLUMN IF NOT EXISTS employee_department text;
ALTER TABLE global_mobility_requests ADD COLUMN IF NOT EXISTS assignment_type text;
ALTER TABLE global_mobility_requests ADD COLUMN IF NOT EXISTS hr_contact text;
ALTER TABLE global_mobility_requests ADD COLUMN IF NOT EXISTS legal_contact text;
ALTER TABLE global_mobility_requests ADD COLUMN IF NOT EXISTS finance_contact text;

-- Neue Tabelle: Mitarbeiter & Familienstatus
CREATE TABLE global_mobility_employee_family (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid REFERENCES global_mobility_requests(id) ON DELETE CASCADE,
  employee_id text NOT NULL,
  contract_status text,
  employment_model text,
  work_time_model text,
  family_members_count integer DEFAULT 0,
  family_members_details jsonb DEFAULT '[]'::jsonb,
  company_id uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RLS für global_mobility_employee_family
ALTER TABLE global_mobility_employee_family ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view employee family data" ON global_mobility_employee_family
  FOR SELECT USING (true);

CREATE POLICY "Users can insert employee family data" ON global_mobility_employee_family
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update employee family data" ON global_mobility_employee_family
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete employee family data" ON global_mobility_employee_family
  FOR DELETE USING (true);

-- Neue Tabelle: Relocation Aufgaben
CREATE TABLE global_mobility_relocation_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid REFERENCES global_mobility_requests(id) ON DELETE CASCADE,
  employee_id text NOT NULL,
  category text NOT NULL,
  task_description text NOT NULL,
  due_date date,
  priority text DEFAULT 'medium',
  status text DEFAULT 'offen',
  assigned_to text,
  notes text,
  company_id uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RLS für global_mobility_relocation_tasks
ALTER TABLE global_mobility_relocation_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view relocation tasks" ON global_mobility_relocation_tasks
  FOR SELECT USING (true);

CREATE POLICY "Users can insert relocation tasks" ON global_mobility_relocation_tasks
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update relocation tasks" ON global_mobility_relocation_tasks
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete relocation tasks" ON global_mobility_relocation_tasks
  FOR DELETE USING (true);

-- Trigger für updated_at
CREATE OR REPLACE FUNCTION update_global_mobility_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_global_mobility_employee_family_updated_at
  BEFORE UPDATE ON global_mobility_employee_family
  FOR EACH ROW EXECUTE FUNCTION update_global_mobility_updated_at();

CREATE TRIGGER update_global_mobility_relocation_tasks_updated_at
  BEFORE UPDATE ON global_mobility_relocation_tasks
  FOR EACH ROW EXECUTE FUNCTION update_global_mobility_updated_at();