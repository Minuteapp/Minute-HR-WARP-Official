# Multi-Tenancy Rollback-Prozeduren

## Übersicht

Dieses Dokument beschreibt die Rollback-Prozeduren für die Multi-Tenancy-Migration. Bei kritischen Problemen können einzelne Phasen oder die gesamte Migration zurückgerollt werden.

## ⚠️ Wichtige Hinweise

1. **Backup zuerst**: Vor jedem Rollback ein vollständiges Backup erstellen
2. **Downtime einplanen**: Rollbacks erfordern Wartungsfenster
3. **Datenintegrität**: Neue Daten nach der Migration können verloren gehen
4. **Reihenfolge beachten**: Rollback in umgekehrter Reihenfolge der Migration

## Rollback-Reihenfolge

```
Phase 9 → 8 → 7 → 6 → 5 → 4 → 3 → 2 → 1 → 0
```

---

## Phase 9: Dokumentation

**Rollback**: Keine Datenbankänderungen, nur Dokumentation löschen.

```bash
rm -rf docs/multi-tenancy/
```

---

## Phase 8: Regression Tests

**Rollback**: Keine Datenbankänderungen, nur Testdateien löschen.

```bash
rm -rf tests/multi-tenancy/
```

---

## Phase 7: Storage Migration

**Rollback**: Storage-Policies und Mapping-Tabelle entfernen.

```sql
-- 1. Storage-Policies entfernen
DROP POLICY IF EXISTS "tenant_storage_select" ON storage.objects;
DROP POLICY IF EXISTS "tenant_storage_insert" ON storage.objects;
DROP POLICY IF EXISTS "tenant_storage_update" ON storage.objects;
DROP POLICY IF EXISTS "tenant_storage_delete" ON storage.objects;
DROP POLICY IF EXISTS "tenant_admin_storage_all" ON storage.objects;

-- 2. Quarantinierte Objekte wiederherstellen (optional)
-- ACHTUNG: Nur wenn die Objekte benötigt werden
-- INSERT INTO storage.objects SELECT * FROM quarantine.storage_objects;

-- 3. Mapping-Tabelle entfernen
DROP TABLE IF EXISTS public.storage_object_tenant_mapping;

-- 4. Helper-Funktion entfernen
DROP FUNCTION IF EXISTS public.get_user_company_id();
```

---

## Phase 6: Views

**Rollback**: Views auf ursprüngliche Version zurücksetzen.

```sql
-- 1. Tenant-scoped Views entfernen
DROP VIEW IF EXISTS public.absence_requests_with_employee;
DROP VIEW IF EXISTS public.employees_with_company;
DROP VIEW IF EXISTS public.helpdesk_tickets_with_sla;
DROP VIEW IF EXISTS public.customer_support_access_log;

-- 2. Original Views wiederherstellen (ohne Tenant-Filter)
CREATE OR REPLACE VIEW public.absence_requests_with_employee AS
SELECT 
  ar.*,
  e.first_name,
  e.last_name,
  e.email,
  e.department
FROM absence_requests ar
LEFT JOIN employees e ON ar.user_id = e.id;

CREATE OR REPLACE VIEW public.employees_with_company AS
SELECT 
  e.*,
  c.name as company_name
FROM employees e
LEFT JOIN companies c ON e.company_id = c.id;

-- Weitere Views nach Bedarf wiederherstellen
```

---

## Phase 5: Trigger

**Rollback**: Audit-Trigger entfernen.

```sql
-- 1. Trigger entfernen
DROP TRIGGER IF EXISTS absence_audit_trigger ON absence_requests;
DROP TRIGGER IF EXISTS employee_audit_trigger ON employees;

-- 2. Trigger-Funktionen entfernen
DROP FUNCTION IF EXISTS public.log_absence_changes();
DROP FUNCTION IF EXISTS public.log_employee_changes();

-- 3. Audit-Tabellen leeren (optional)
TRUNCATE TABLE absence_audit_trail;
```

---

## Phase 4: Indizes

**Rollback**: Tenant-Indizes entfernen.

```sql
-- Alle company_id Indizes entfernen
DO $$
DECLARE
  idx_record RECORD;
BEGIN
  FOR idx_record IN
    SELECT indexname, tablename
    FROM pg_indexes
    WHERE schemaname = 'public'
    AND indexname LIKE 'idx_%_company_id'
  LOOP
    EXECUTE format('DROP INDEX IF EXISTS public.%I', idx_record.indexname);
    RAISE NOTICE 'Dropped index: %', idx_record.indexname;
  END LOOP;
END $$;
```

---

## Phase 3: RLS Policies

**Rollback**: Tenant-basierte RLS-Policies entfernen.

```sql
-- 1. Alle tenant_isolation Policies entfernen
DO $$
DECLARE
  policy_record RECORD;
BEGIN
  FOR policy_record IN
    SELECT policyname, tablename
    FROM pg_policies
    WHERE schemaname = 'public'
    AND policyname LIKE 'tenant_%'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', 
                   policy_record.policyname, 
                   policy_record.tablename);
    RAISE NOTICE 'Dropped policy: % on %', 
                 policy_record.policyname, 
                 policy_record.tablename;
  END LOOP;
END $$;

-- 2. RLS auf kritischen Tabellen deaktivieren (VORSICHT!)
-- Nur wenn wirklich nötig und andere Sicherheitsmaßnahmen vorhanden
-- ALTER TABLE absence_requests DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE employees DISABLE ROW LEVEL SECURITY;
-- etc.
```

---

## Phase 2: Foreign Keys

**Rollback**: company_id Foreign Keys entfernen.

```sql
-- Foreign Keys entfernen
DO $$
DECLARE
  fk_record RECORD;
BEGIN
  FOR fk_record IN
    SELECT 
      tc.constraint_name,
      tc.table_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
      ON tc.constraint_name = kcu.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
    AND kcu.column_name = 'company_id'
  LOOP
    EXECUTE format('ALTER TABLE public.%I DROP CONSTRAINT IF EXISTS %I',
                   fk_record.table_name,
                   fk_record.constraint_name);
    RAISE NOTICE 'Dropped FK: % on %', 
                 fk_record.constraint_name, 
                 fk_record.table_name;
  END LOOP;
END $$;
```

---

## Phase 1: company_id Backfill

**Rollback**: company_id Spalten entfernen (DATENVERLUST!).

```sql
-- ⚠️ ACHTUNG: Dies entfernt die company_id Spalten und alle zugehörigen Daten!

-- Liste der betroffenen Tabellen
DO $$
DECLARE
  tbl_record RECORD;
BEGIN
  FOR tbl_record IN
    SELECT table_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND column_name = 'company_id'
    AND table_name NOT IN ('companies', 'user_roles') -- Ausnahmen
  LOOP
    -- Prüfen ob Spalte existiert und entfernen
    EXECUTE format('ALTER TABLE public.%I DROP COLUMN IF EXISTS company_id',
                   tbl_record.table_name);
    RAISE NOTICE 'Dropped company_id from: %', tbl_record.table_name;
  END LOOP;
END $$;
```

---

## Phase 0: Quarantine-Schema

**Rollback**: Quarantine-Schema und Daten entfernen.

```sql
-- 1. Quarantinierte Daten zurück in Haupttabellen (optional)
-- WARNUNG: Nur wenn die Daten benötigt werden!

-- 2. Quarantine-Schema entfernen
DROP SCHEMA IF EXISTS quarantine CASCADE;

-- 3. Tenant-Funktionen entfernen
DROP FUNCTION IF EXISTS public.current_tenant_id();
DROP FUNCTION IF EXISTS public.set_tenant_context(UUID);
```

---

## Vollständiger Rollback

**⚠️ WARNUNG**: Nur im absoluten Notfall verwenden!

```sql
-- VOLLSTÄNDIGER ROLLBACK - ALLE MULTI-TENANCY ÄNDERUNGEN ENTFERNEN

BEGIN;

-- 1. Quarantine-Schema entfernen
DROP SCHEMA IF EXISTS quarantine CASCADE;

-- 2. Storage-Mapping entfernen
DROP TABLE IF EXISTS public.storage_object_tenant_mapping;

-- 3. Alle tenant_* Policies entfernen
DO $$
DECLARE
  policy_record RECORD;
BEGIN
  FOR policy_record IN
    SELECT policyname, tablename
    FROM pg_policies
    WHERE schemaname = 'public'
    AND policyname LIKE 'tenant_%'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', 
                   policy_record.policyname, 
                   policy_record.tablename);
  END LOOP;
END $$;

-- 4. Tenant-Funktionen entfernen
DROP FUNCTION IF EXISTS public.current_tenant_id();
DROP FUNCTION IF EXISTS public.set_tenant_context(UUID);
DROP FUNCTION IF EXISTS public.get_user_company_id();

-- 5. Audit-Trigger entfernen
DROP TRIGGER IF EXISTS absence_audit_trigger ON absence_requests;
DROP FUNCTION IF EXISTS public.log_absence_changes();

-- 6. Indizes entfernen
DO $$
DECLARE
  idx_record RECORD;
BEGIN
  FOR idx_record IN
    SELECT indexname
    FROM pg_indexes
    WHERE schemaname = 'public'
    AND indexname LIKE 'idx_%_company_id'
  LOOP
    EXECUTE format('DROP INDEX IF EXISTS public.%I', idx_record.indexname);
  END LOOP;
END $$;

COMMIT;
```

---

## Rollback-Verifizierung

Nach jedem Rollback diese Checks durchführen:

```sql
-- 1. Prüfen ob Quarantine-Schema existiert
SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'quarantine';

-- 2. Prüfen ob tenant_* Policies existieren
SELECT COUNT(*) FROM pg_policies WHERE policyname LIKE 'tenant_%';

-- 3. Prüfen ob company_id Indizes existieren
SELECT COUNT(*) FROM pg_indexes WHERE indexname LIKE 'idx_%_company_id';

-- 4. Prüfen ob Tenant-Funktionen existieren
SELECT proname FROM pg_proc WHERE proname IN ('current_tenant_id', 'set_tenant_context', 'get_user_company_id');

-- 5. RLS-Status prüfen
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' AND rowsecurity = true;
```

---

## Notfall-Kontakte

Bei kritischen Problemen während des Rollbacks:

1. **Datenbank-Admin**: [Kontakt eintragen]
2. **DevOps-Team**: [Kontakt eintragen]
3. **Supabase-Support**: https://supabase.com/support

---

## Changelog

| Datum | Version | Änderung |
|-------|---------|----------|
| 2025-01-29 | 1.0 | Initiale Rollback-Dokumentation |
