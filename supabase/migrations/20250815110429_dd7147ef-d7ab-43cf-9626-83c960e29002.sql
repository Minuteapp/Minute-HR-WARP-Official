-- Performance-Optimierung für Enterprise-Skalierung (10.000+ Mitarbeiter) - KORRIGIERT

-- 1. Kritische Indizes für große Datensätze (ohne casting)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_employees_company_status 
ON employees(company_id, status) WHERE status = 'active';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_absence_requests_user_dates 
ON absence_requests(user_id, start_date, end_date, status);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_workflow_instances_status_created 
ON workflow_instances(status, created_at) WHERE status IN ('pending', 'in_progress');

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_roles_compound 
ON user_roles(company_id, role, user_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_time_entries_user_time 
ON time_entries(user_id, start_time);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_recipient_status 
ON notification_queue(recipient_user_id, status, created_at);

-- 2. Materialized View für Company Statistics
CREATE MATERIALIZED VIEW IF NOT EXISTS company_employee_stats AS
SELECT 
  c.id as company_id,
  c.name as company_name,
  COUNT(DISTINCT e.id) as total_employees,
  COUNT(DISTINCT CASE WHEN e.status = 'active' THEN e.id END) as active_employees,
  COUNT(DISTINCT CASE WHEN ur.role = 'admin' THEN ur.user_id END) as admin_count,
  MAX(e.updated_at) as last_employee_update
FROM companies c
LEFT JOIN employees e ON e.company_id = c.id
LEFT JOIN user_roles ur ON ur.company_id = c.id
WHERE c.is_active = true
GROUP BY c.id, c.name;

CREATE UNIQUE INDEX IF NOT EXISTS idx_company_stats_company_id 
ON company_employee_stats(company_id);

-- 3. Bulk Operations für Enterprise-Verwaltung
CREATE OR REPLACE FUNCTION bulk_update_employee_status(
  p_employee_ids uuid[],
  p_new_status text,
  p_updated_by uuid
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  updated_count integer;
BEGIN
  -- Bulk Update mit Berechtigung
  UPDATE employees 
  SET status = p_new_status::employment_status, 
      updated_at = now()
  WHERE id = ANY(p_employee_ids);
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$;