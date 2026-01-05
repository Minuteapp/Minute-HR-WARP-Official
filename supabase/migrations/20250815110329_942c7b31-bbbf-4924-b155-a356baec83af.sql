-- Performance-Optimierung für Enterprise-Skalierung (10.000+ Mitarbeiter)

-- 1. Kritische Indizes für große Datensätze
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_employees_company_id_status 
ON employees(company_id, status) WHERE status = 'active';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_absence_requests_user_company_date 
ON absence_requests(user_id, start_date, end_date) WHERE status IN ('pending', 'approved');

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_workflow_instances_status_company 
ON workflow_instances(status, created_at) WHERE status IN ('pending', 'in_progress');

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_roles_company_role 
ON user_roles(company_id, role, user_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_time_entries_user_date 
ON time_entries(user_id, start_time::date);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_user_status 
ON notification_queue(recipient_user_id, status, created_at);

-- 2. Partitionierung für große Zeitdaten (falls tables existieren)
DO $$
BEGIN
  -- Prüfe und erstelle Partitionierung für audit_logs falls vorhanden
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audit_logs') THEN
    -- Monatliche Partitionierung für Audit-Logs
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at_month 
             ON audit_logs(DATE_TRUNC(''month'', created_at))';
  END IF;
END $$;

-- 3. Materialized Views für häufige Abfragen
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

-- 4. Refresh-Funktion für Materialized View
CREATE OR REPLACE FUNCTION refresh_company_stats()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY company_employee_stats;
END;
$$;

-- 5. Database-Funktionen für effiziente Bulk-Operationen
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
  -- Berechtigung prüfen
  IF NOT (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = p_updated_by AND role IN ('admin', 'hr', 'superadmin'))
  ) THEN
    RAISE EXCEPTION 'Nicht berechtigt für Bulk-Updates';
  END IF;
  
  -- Bulk Update
  UPDATE employees 
  SET status = p_new_status::employment_status, 
      updated_at = now()
  WHERE id = ANY(p_employee_ids)
    AND (
      company_id = get_user_company_id(p_updated_by) 
      OR is_superadmin_safe(p_updated_by)
    );
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  
  -- Audit Log
  INSERT INTO security_audit_logs (user_id, action, resource_type, details)
  VALUES (p_updated_by, 'bulk_employee_update', 'employees', 
          jsonb_build_object('updated_count', updated_count, 'new_status', p_new_status));
  
  RETURN updated_count;
END;
$$;

-- 6. Performance-Settings für große Tabellen
ALTER TABLE employees SET (fillfactor = 85);
ALTER TABLE absence_requests SET (fillfactor = 90);
ALTER TABLE workflow_instances SET (fillfactor = 90);

-- 7. Auto-Vacuum Optimierung für häufig veränderte Tabellen
ALTER TABLE notification_queue SET (
  autovacuum_vacuum_scale_factor = 0.1,
  autovacuum_analyze_scale_factor = 0.05
);

-- 8. Trigger für automatische Stats-Refresh
CREATE OR REPLACE FUNCTION trigger_refresh_company_stats()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Asynchron refreshen (ohne Blockierung)
  PERFORM pg_notify('refresh_stats', 'company_employee_stats');
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Trigger für Employee-Änderungen
DROP TRIGGER IF EXISTS refresh_stats_on_employee_change ON employees;
CREATE TRIGGER refresh_stats_on_employee_change
  AFTER INSERT OR UPDATE OR DELETE ON employees
  FOR EACH STATEMENT EXECUTE FUNCTION trigger_refresh_company_stats();