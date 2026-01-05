
-- =====================================================
-- PHASE 3: SICHERE DATENMIGRATION
-- Deaktiviere spezifische User-Trigger vor Migration
-- =====================================================

-- 1. Kritische Trigger auf absence_requests deaktivieren
ALTER TABLE absence_requests DISABLE TRIGGER sync_absence_events;
ALTER TABLE absence_requests DISABLE TRIGGER trigger_sync_absence_events;
ALTER TABLE absence_requests DISABLE TRIGGER trigger_sync_absence_to_calendar;
ALTER TABLE absence_requests DISABLE TRIGGER sync_approved_absence_trigger;
ALTER TABLE absence_requests DISABLE TRIGGER trigger_sync_approved_absence;
ALTER TABLE absence_requests DISABLE TRIGGER set_absence_requests_company_id;
ALTER TABLE absence_requests DISABLE TRIGGER sync_cross_module_events_trigger;

-- 2. Kritische Trigger auf calendar_events deaktivieren
ALTER TABLE calendar_events DISABLE TRIGGER set_calendar_events_company_id;
ALTER TABLE calendar_events DISABLE TRIGGER set_company_id_calendar_events;

-- 3. Trigger auf documents deaktivieren falls vorhanden
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_documents_company_id') THEN
    EXECUTE 'ALTER TABLE documents DISABLE TRIGGER set_documents_company_id';
  END IF;
END $$;

-- 4. Datenmigration für absence_requests
UPDATE absence_requests ar
SET company_id = e.company_id
FROM employees e
WHERE ar.user_id = e.id
  AND ar.company_id IS NULL
  AND e.company_id IS NOT NULL;

-- 5. Datenmigration für documents (von created_by über employees)
UPDATE documents d
SET company_id = e.company_id
FROM employees e
WHERE d.created_by = e.id
  AND d.company_id IS NULL
  AND e.company_id IS NOT NULL;

-- 6. Trigger wieder aktivieren
ALTER TABLE absence_requests ENABLE TRIGGER sync_absence_events;
ALTER TABLE absence_requests ENABLE TRIGGER trigger_sync_absence_events;
ALTER TABLE absence_requests ENABLE TRIGGER trigger_sync_absence_to_calendar;
ALTER TABLE absence_requests ENABLE TRIGGER sync_approved_absence_trigger;
ALTER TABLE absence_requests ENABLE TRIGGER trigger_sync_approved_absence;
ALTER TABLE absence_requests ENABLE TRIGGER set_absence_requests_company_id;
ALTER TABLE absence_requests ENABLE TRIGGER sync_cross_module_events_trigger;

ALTER TABLE calendar_events ENABLE TRIGGER set_calendar_events_company_id;
ALTER TABLE calendar_events ENABLE TRIGGER set_company_id_calendar_events;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_documents_company_id') THEN
    EXECUTE 'ALTER TABLE documents ENABLE TRIGGER set_documents_company_id';
  END IF;
END $$;
