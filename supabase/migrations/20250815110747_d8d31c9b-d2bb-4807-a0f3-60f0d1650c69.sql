-- Performance-Optimierung für Enterprise-Skalierung (EINFACH & SICHER)

-- 1. Kritische Indizes für bestehende Tabellen
CREATE INDEX IF NOT EXISTS idx_employees_company_status 
ON employees(company_id, status) WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_absence_requests_user_dates 
ON absence_requests(user_id, start_date, end_date, status);

CREATE INDEX IF NOT EXISTS idx_workflow_instances_status_created 
ON workflow_instances(status, created_at) WHERE status IN ('pending', 'in_progress');

CREATE INDEX IF NOT EXISTS idx_user_roles_compound 
ON user_roles(company_id, role, user_id);

-- 2. Materialized View für Company Statistics (OHNE notification_queue)
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
  UPDATE employees 
  SET status = p_new_status::employment_status, 
      updated_at = now()
  WHERE id = ANY(p_employee_ids);
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$;

-- 4. Pagination Helper für große Listen
CREATE OR REPLACE FUNCTION get_employees_paginated(
  p_company_id uuid,
  p_limit integer DEFAULT 50,
  p_offset integer DEFAULT 0,
  p_search text DEFAULT NULL
)
RETURNS TABLE(
  id uuid,
  name text,
  email text,
  status employment_status,
  department text,
  total_count bigint
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.id,
    e.name,
    e.email,
    e.status,
    e.department,
    COUNT(*) OVER() as total_count
  FROM employees e
  WHERE e.company_id = p_company_id
    AND (p_search IS NULL OR 
         e.name ILIKE '%' || p_search || '%' OR
         e.email ILIKE '%' || p_search || '%')
  ORDER BY e.name
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;