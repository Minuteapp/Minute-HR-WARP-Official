# Multi-Tenancy Operations Guide

## Tägliche Operationen

### 1. Tenant-Status prüfen

```sql
-- Anzahl aktiver Tenants
SELECT COUNT(*) as active_tenants FROM companies WHERE is_active = true;

-- Tenants mit meisten Benutzern
SELECT 
  c.name,
  COUNT(ur.user_id) as user_count
FROM companies c
LEFT JOIN user_roles ur ON c.id = ur.company_id
GROUP BY c.id, c.name
ORDER BY user_count DESC
LIMIT 10;

-- Tenants mit meisten Daten
SELECT 
  c.name,
  (SELECT COUNT(*) FROM employees e WHERE e.company_id = c.id) as employees,
  (SELECT COUNT(*) FROM absence_requests ar WHERE ar.company_id = c.id) as absences,
  (SELECT COUNT(*) FROM time_entries te WHERE te.company_id = c.id) as time_entries
FROM companies c
ORDER BY employees DESC
LIMIT 10;
```

### 2. Orphaned Data prüfen

```sql
-- Verwaiste Benutzerrollen
SELECT COUNT(*) FROM quarantine.orphaned_user_roles;

-- Verwaiste Mitarbeiter
SELECT COUNT(*) FROM quarantine.orphaned_employees;

-- Verwaiste Abwesenheitsanträge
SELECT COUNT(*) FROM quarantine.orphaned_absence_requests;

-- Nicht zugeordnete Storage-Objekte
SELECT COUNT(*) FROM quarantine.storage_objects;
```

### 3. RLS-Policy-Verstöße prüfen

```sql
-- Letzte RLS-Fehler im Log
SELECT 
  identifier,
  timestamp,
  event_message
FROM postgres_logs
CROSS JOIN unnest(metadata) as m
CROSS JOIN unnest(m.parsed) as parsed
WHERE event_message LIKE '%row-level security%'
ORDER BY timestamp DESC
LIMIT 20;
```

---

## Wöchentliche Operationen

### 1. Datenintegrität prüfen

```sql
-- Tabellen ohne company_id (sollte leer sein für mandantenfähige Tabellen)
SELECT table_name
FROM information_schema.tables t
WHERE t.table_schema = 'public'
AND t.table_type = 'BASE TABLE'
AND t.table_name NOT IN ('companies', 'schema_migrations', 'spatial_ref_sys')
AND NOT EXISTS (
  SELECT 1 FROM information_schema.columns c
  WHERE c.table_schema = t.table_schema
  AND c.table_name = t.table_name
  AND c.column_name = 'company_id'
);

-- Zeilen ohne company_id (pro Tabelle)
DO $$
DECLARE
  tbl_record RECORD;
  null_count INTEGER;
BEGIN
  FOR tbl_record IN
    SELECT table_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND column_name = 'company_id'
  LOOP
    EXECUTE format('SELECT COUNT(*) FROM public.%I WHERE company_id IS NULL', tbl_record.table_name)
    INTO null_count;
    
    IF null_count > 0 THEN
      RAISE NOTICE 'Table % has % rows with NULL company_id', tbl_record.table_name, null_count;
    END IF;
  END LOOP;
END $$;
```

### 2. Index-Nutzung prüfen

```sql
-- Ungenutzte Indizes
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
AND idx_scan = 0
AND indexname LIKE 'idx_%_company_id'
ORDER BY tablename;

-- Index-Größen
SELECT 
  tablename,
  indexname,
  pg_size_pretty(pg_relation_size(indexrelid)) as index_size
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
AND indexname LIKE 'idx_%_company_id'
ORDER BY pg_relation_size(indexrelid) DESC;
```

### 3. Query-Performance prüfen

```sql
-- Langsame Queries mit RLS
SELECT 
  query,
  calls,
  mean_exec_time,
  total_exec_time
FROM pg_stat_statements
WHERE query LIKE '%company_id%'
ORDER BY mean_exec_time DESC
LIMIT 20;
```

---

## Monatliche Operationen

### 1. Quarantine-Daten bereinigen

```sql
-- Alte Quarantine-Daten löschen (älter als 90 Tage)
DELETE FROM quarantine.orphaned_user_roles 
WHERE quarantined_at < NOW() - INTERVAL '90 days';

DELETE FROM quarantine.orphaned_employees 
WHERE quarantined_at < NOW() - INTERVAL '90 days';

DELETE FROM quarantine.orphaned_absence_requests 
WHERE quarantined_at < NOW() - INTERVAL '90 days';

DELETE FROM quarantine.storage_objects 
WHERE quarantined_at < NOW() - INTERVAL '90 days';
```

### 2. Tenant-Wachstum analysieren

```sql
-- Datenwachstum pro Tenant
WITH monthly_growth AS (
  SELECT 
    company_id,
    DATE_TRUNC('month', created_at) as month,
    COUNT(*) as new_records
  FROM absence_requests
  WHERE created_at > NOW() - INTERVAL '12 months'
  GROUP BY company_id, DATE_TRUNC('month', created_at)
)
SELECT 
  c.name,
  mg.month,
  mg.new_records
FROM monthly_growth mg
JOIN companies c ON c.id = mg.company_id
ORDER BY c.name, mg.month;
```

### 3. RLS-Policies auditieren

```sql
-- Alle aktiven RLS-Policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Tabellen ohne RLS
SELECT tablename
FROM pg_tables
WHERE schemaname = 'public'
AND tablename NOT IN (
  SELECT DISTINCT tablename FROM pg_policies WHERE schemaname = 'public'
)
AND tablename NOT IN ('schema_migrations', 'spatial_ref_sys');
```

---

## Tenant-Management

### Neuen Tenant erstellen

```sql
-- 1. Company erstellen
INSERT INTO companies (id, name, is_active)
VALUES (gen_random_uuid(), 'Neue Firma GmbH', true)
RETURNING id;

-- 2. Admin-Benutzer zuweisen (nach Auth-Registrierung)
INSERT INTO user_roles (user_id, company_id, role)
VALUES ('user-uuid', 'company-uuid', 'admin');

-- 3. Standard-Einstellungen erstellen
INSERT INTO company_settings (company_id, setting_key, setting_value)
VALUES 
  ('company-uuid', 'default_language', '"de"'),
  ('company-uuid', 'timezone', '"Europe/Berlin"');
```

### Tenant deaktivieren

```sql
-- Soft-Delete: Tenant deaktivieren
UPDATE companies 
SET is_active = false, 
    deactivated_at = NOW()
WHERE id = 'company-uuid';

-- Alle Benutzerrollen deaktivieren
UPDATE user_roles 
SET is_active = false
WHERE company_id = 'company-uuid';
```

### Tenant löschen (Hard-Delete)

```sql
-- ⚠️ WARNUNG: Unwiderruflich!

BEGIN;

-- 1. Alle abhängigen Daten löschen (CASCADE)
DELETE FROM companies WHERE id = 'company-uuid';

-- 2. Verwaiste Auth-Benutzer entfernen (optional)
-- Dies muss über die Supabase Admin-API erfolgen

COMMIT;
```

### Tenant-Daten exportieren

```sql
-- Export als JSON
SELECT json_agg(t) FROM (
  SELECT 
    c.*,
    (SELECT json_agg(e) FROM employees e WHERE e.company_id = c.id) as employees,
    (SELECT json_agg(ar) FROM absence_requests ar WHERE ar.company_id = c.id) as absences
  FROM companies c
  WHERE c.id = 'company-uuid'
) t;
```

---

## Troubleshooting

### Problem: Benutzer sieht keine Daten

```sql
-- 1. Benutzerrolle prüfen
SELECT * FROM user_roles WHERE user_id = 'user-uuid';

-- 2. Tenant-Kontext prüfen
SELECT public.current_tenant_id();

-- 3. Direkte Abfrage mit Service-Role
SELECT COUNT(*) FROM absence_requests WHERE company_id = 'company-uuid';
```

### Problem: RLS-Policy-Fehler

```sql
-- 1. Policy-Definition prüfen
SELECT * FROM pg_policies WHERE tablename = 'table_name';

-- 2. RLS-Status prüfen
SELECT relrowsecurity FROM pg_class WHERE relname = 'table_name';

-- 3. Test-Query als Benutzer
SET LOCAL role = 'authenticated';
SET LOCAL request.jwt.claim.sub = 'user-uuid';
SELECT * FROM table_name LIMIT 1;
RESET role;
RESET request.jwt.claim.sub;
```

### Problem: Cross-Tenant-Leak

```sql
-- 1. Alle Policies der Tabelle prüfen
SELECT policyname, qual, with_check 
FROM pg_policies 
WHERE tablename = 'affected_table';

-- 2. Prüfen ob company_id in WHERE-Bedingung
EXPLAIN ANALYZE 
SELECT * FROM affected_table 
WHERE id = 'record-uuid';

-- 3. Betroffene Daten identifizieren
SELECT DISTINCT company_id 
FROM affected_table 
WHERE id = 'record-uuid';
```

---

## Monitoring-Queries

### Dashboard-Metriken

```sql
-- Tenant-Übersicht
SELECT 
  (SELECT COUNT(*) FROM companies WHERE is_active = true) as active_tenants,
  (SELECT COUNT(DISTINCT user_id) FROM user_roles) as total_users,
  (SELECT COUNT(*) FROM quarantine.orphaned_user_roles) as orphaned_roles,
  (SELECT COUNT(*) FROM quarantine.orphaned_employees) as orphaned_employees;

-- Aktivität letzte 24h
SELECT 
  c.name,
  (SELECT COUNT(*) FROM absence_requests ar 
   WHERE ar.company_id = c.id 
   AND ar.created_at > NOW() - INTERVAL '24 hours') as new_absences,
  (SELECT COUNT(*) FROM time_entries te 
   WHERE te.company_id = c.id 
   AND te.created_at > NOW() - INTERVAL '24 hours') as new_time_entries
FROM companies c
WHERE c.is_active = true
ORDER BY new_absences DESC
LIMIT 10;
```

### Alerts

```sql
-- Tenants mit ungewöhnlich vielen Fehlern
SELECT 
  company_id,
  COUNT(*) as error_count
FROM ai_gateway_audit_log
WHERE status = 'error'
AND created_at > NOW() - INTERVAL '1 hour'
GROUP BY company_id
HAVING COUNT(*) > 100
ORDER BY error_count DESC;

-- Tenants nahe am Limit
SELECT 
  c.name,
  (SELECT COUNT(*) FROM employees e WHERE e.company_id = c.id) as employee_count,
  cs.max_employees
FROM companies c
JOIN company_subscriptions cs ON cs.company_id = c.id
WHERE (SELECT COUNT(*) FROM employees e WHERE e.company_id = c.id) > cs.max_employees * 0.9;
```
