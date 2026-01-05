
-- =====================================================
-- PHASE 3: BATCH 2 - Weitere Tabellen migrieren
-- =====================================================

-- 1. documents: created_by ist auth.uid() → über user_roles
UPDATE documents d
SET company_id = ur.company_id
FROM user_roles ur
WHERE d.created_by = ur.user_id
  AND d.company_id IS NULL
  AND ur.company_id IS NOT NULL;

-- 2. absences: employee_id → employees
UPDATE absences a
SET company_id = e.company_id
FROM employees e
WHERE a.employee_id = e.id
  AND a.company_id IS NULL
  AND e.company_id IS NOT NULL;

-- 3. absence_notifications: user_id ist employee_id
UPDATE absence_notifications an
SET company_id = e.company_id
FROM employees e
WHERE an.user_id = e.id
  AND an.company_id IS NULL
  AND e.company_id IS NOT NULL;

-- 4. ai_settings: user_id ist auth.uid() → user_roles
UPDATE ai_settings ais
SET company_id = ur.company_id
FROM user_roles ur
WHERE ais.user_id = ur.user_id
  AND ais.company_id IS NULL
  AND ur.company_id IS NOT NULL;

-- 5. ai_usage_logs: user_id ist auth.uid() → user_roles
UPDATE ai_usage_logs aul
SET company_id = ur.company_id
FROM user_roles ur
WHERE aul.user_id = ur.user_id
  AND aul.company_id IS NULL
  AND ur.company_id IS NOT NULL;

-- 6. audit_logs: user_id → user_roles
UPDATE audit_logs al
SET company_id = ur.company_id
FROM user_roles ur
WHERE al.user_id = ur.user_id
  AND al.company_id IS NULL
  AND ur.company_id IS NOT NULL;

-- 7. api_rate_limits: user_id → user_roles
UPDATE api_rate_limits arl
SET company_id = ur.company_id
FROM user_roles ur
WHERE arl.user_id = ur.user_id
  AND arl.company_id IS NULL
  AND ur.company_id IS NOT NULL;

-- 8. api_usage_logs: user_id → user_roles  
UPDATE api_usage_logs aul2
SET company_id = ur.company_id
FROM user_roles ur
WHERE aul2.user_id = ur.user_id
  AND aul2.company_id IS NULL
  AND ur.company_id IS NOT NULL;
