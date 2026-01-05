-- ===================================================================
-- PHASE 1: MINIMALE DATENBEREINIGUNG
-- Nur Mitarbeiter ohne Firma löschen
-- ===================================================================

-- Lösche nur Mitarbeiter ohne company_id
DELETE FROM public.employees WHERE company_id IS NULL;

-- Lösche Mockup-Mitarbeiter mit Test-Namen
DELETE FROM public.employees 
WHERE name ILIKE '%test%'
   OR name ILIKE '%demo%'
   OR name ILIKE '%mock%'
   OR email ILIKE '%test@%'
   OR email ILIKE '%demo@%';

DO $$
BEGIN
  RAISE NOTICE '✅ Phase 1 minimal abgeschlossen: Mitarbeiter ohne Firma gelöscht';
END $$;