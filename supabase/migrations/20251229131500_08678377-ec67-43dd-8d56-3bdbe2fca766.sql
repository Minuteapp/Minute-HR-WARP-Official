
-- =====================================================
-- PHASE 3: BATCH 3 - Korrigiert (nur existierende Tabellen)
-- =====================================================

-- 1. absence_documents: über absence_request_id
UPDATE absence_documents ad
SET company_id = ar.company_id
FROM absence_requests ar
WHERE ad.absence_request_id = ar.id
  AND ad.company_id IS NULL
  AND ar.company_id IS NOT NULL;

-- 2. absence_queries: über absence_request_id
UPDATE absence_queries aq
SET company_id = ar.company_id
FROM absence_requests ar
WHERE aq.absence_request_id = ar.id
  AND aq.company_id IS NULL
  AND ar.company_id IS NOT NULL;

-- 3. absence_audit_trail: über absence_request_id
UPDATE absence_audit_trail aat
SET company_id = ar.company_id
FROM absence_requests ar
WHERE aat.absence_request_id = ar.id
  AND aat.company_id IS NULL
  AND ar.company_id IS NOT NULL;

-- 4. absence_auto_notifications: über absence_request_id
UPDATE absence_auto_notifications aan
SET company_id = ar.company_id
FROM absence_requests ar
WHERE aan.absence_request_id = ar.id
  AND aan.company_id IS NULL
  AND ar.company_id IS NOT NULL;

-- 5. document_versions: über document_id (falls existiert)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'document_versions') THEN
    EXECUTE 'UPDATE document_versions dv SET company_id = d.company_id FROM documents d WHERE dv.document_id = d.id AND dv.company_id IS NULL AND d.company_id IS NOT NULL';
  END IF;
END $$;

-- 6. document_access_logs: über document_id (falls existiert)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'document_access_logs') THEN
    EXECUTE 'UPDATE document_access_logs dal SET company_id = d.company_id FROM documents d WHERE dal.document_id = d.id AND dal.company_id IS NULL AND d.company_id IS NOT NULL';
  END IF;
END $$;

-- 7. time_entry_corrections: über time_entry_id (falls existiert)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'time_entry_corrections') THEN
    EXECUTE 'UPDATE time_entry_corrections tec SET company_id = te.company_id FROM time_entries te WHERE tec.time_entry_id = te.id AND tec.company_id IS NULL AND te.company_id IS NOT NULL';
  END IF;
END $$;

-- 8. time_entry_comments: über time_entry_id (falls existiert)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'time_entry_comments') THEN
    EXECUTE 'UPDATE time_entry_comments teco SET company_id = te.company_id FROM time_entries te WHERE teco.time_entry_id = te.id AND teco.company_id IS NULL AND te.company_id IS NOT NULL';
  END IF;
END $$;
