-- 1. View für Abwesenheiten mit Employee-Daten
CREATE OR REPLACE VIEW absence_requests_with_employee AS
SELECT 
  ar.id,
  ar.user_id,
  ar.type,
  ar.absence_type,
  ar.start_date,
  ar.end_date,
  ar.status,
  ar.reason,
  ar.half_day,
  ar.is_partial_day,
  ar.start_time,
  ar.end_time,
  ar.partial_start_time,
  ar.partial_end_time,
  ar.substitute_id,
  ar.substitute_user_id,
  ar.created_at,
  ar.updated_at,
  ar.approved_by,
  ar.approved_at,
  ar.rejected_by,
  ar.rejected_at,
  ar.rejection_reason,
  ar.document_required,
  ar.comments,
  ar.department AS request_department,
  ar.employee_name AS request_employee_name,
  e.first_name || ' ' || e.last_name AS employee_name,
  e.department,
  e.city AS location,
  e.email,
  e.phone,
  e.employee_number,
  e.position,
  sub.first_name || ' ' || sub.last_name AS substitute_name,
  sub.email AS substitute_email
FROM absence_requests ar
LEFT JOIN employees e ON e.id = ar.user_id
LEFT JOIN employees sub ON sub.id = ar.substitute_id;

-- 2. Approval Workflow History Tabelle
CREATE TABLE IF NOT EXISTS approval_workflow_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  absence_request_id UUID REFERENCES absence_requests(id) ON DELETE CASCADE,
  level INTEGER NOT NULL,
  approver_id UUID,
  approver_name TEXT,
  approver_role TEXT,
  status TEXT CHECK (status IN ('approved', 'rejected', 'pending')),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. RLS für approval_workflow_history
ALTER TABLE approval_workflow_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view workflow history for their requests"
ON approval_workflow_history FOR SELECT
USING (
  absence_request_id IN (
    SELECT id FROM absence_requests WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Admins can view all workflow history"
ON approval_workflow_history FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
);

CREATE POLICY "Admins can insert workflow history"
ON approval_workflow_history FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
);

-- 4. Function für automatisches Erstellen von Workflow-Steps
CREATE OR REPLACE FUNCTION create_approval_workflow_step()
RETURNS TRIGGER AS $$
DECLARE
  approver_employee RECORD;
  next_level INTEGER;
BEGIN
  IF NEW.status = 'approved' AND OLD.status = 'pending' THEN
    SELECT first_name || ' ' || last_name AS name, department
    INTO approver_employee
    FROM employees
    WHERE id = NEW.approved_by;
    
    SELECT COALESCE(MAX(level), 0) + 1
    INTO next_level
    FROM approval_workflow_history
    WHERE absence_request_id = NEW.id;
    
    INSERT INTO approval_workflow_history (
      absence_request_id,
      level,
      approver_id,
      approver_name,
      approver_role,
      status,
      comment
    ) VALUES (
      NEW.id,
      next_level,
      NEW.approved_by,
      COALESCE(approver_employee.name, 'Unbekannt'),
      COALESCE(approver_employee.department, 'Admin'),
      'approved',
      'Genehmigt'
    );
  END IF;
  
  IF NEW.status = 'rejected' AND OLD.status = 'pending' THEN
    SELECT first_name || ' ' || last_name AS name, department
    INTO approver_employee
    FROM employees
    WHERE id = NEW.rejected_by;
    
    SELECT COALESCE(MAX(level), 0) + 1
    INTO next_level
    FROM approval_workflow_history
    WHERE absence_request_id = NEW.id;
    
    INSERT INTO approval_workflow_history (
      absence_request_id,
      level,
      approver_id,
      approver_name,
      approver_role,
      status,
      comment
    ) VALUES (
      NEW.id,
      next_level,
      NEW.rejected_by,
      COALESCE(approver_employee.name, 'Unbekannt'),
      COALESCE(approver_employee.department, 'Admin'),
      'rejected',
      COALESCE(NEW.rejection_reason, 'Abgelehnt')
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Trigger für automatische Workflow-History
DROP TRIGGER IF EXISTS trigger_create_approval_workflow_step ON absence_requests;
CREATE TRIGGER trigger_create_approval_workflow_step
  AFTER UPDATE ON absence_requests
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION create_approval_workflow_step();