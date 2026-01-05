-- ===================================================================
-- GEZIELTE SUPERADMIN POLICY BEREINIGUNG (Deadlock-Vermeidung)
-- Problem: SuperAdmin Override-Policy blockiert Multi-Tenant Isolation
-- Lösung: Schrittweise, gezielte Policy-Entfernung ohne Locks
-- ===================================================================

-- Nur die kritische Override-Policy entfernen die das Problem verursacht
DROP POLICY IF EXISTS "SuperAdmin full access to absence_requests" ON public.absence_requests;

-- Verification: Prüfe dass Policy entfernt wurde
SELECT 
  tablename, 
  policyname,
  cmd,
  'POLICY REMOVED' as status
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'absence_requests'
  AND policyname LIKE '%SuperAdmin%';

-- Audit Log für die Bereinigung
INSERT INTO public.security_audit_logs (
  user_id, action, resource_type, resource_id, details, risk_level
) VALUES (
  auth.uid(), 
  'critical_superadmin_policy_removed', 
  'rls_policy', 
  'absence_requests_superadmin_override',
  jsonb_build_object(
    'policy_removed', 'SuperAdmin full access to absence_requests',
    'issue', 'Override-Policy verhinderte Multi-Tenant Isolation',
    'result', 'SuperAdmin sieht jetzt nur eigene Firma-Daten',
    'next_step', 'Teste Isolation mit neuer Firma'
  ),
  'critical'
);

SELECT 
  'KRITISCHE POLICY ENTFERNT! 🎯' as status,
  'SuperAdmin unterliegt jetzt Multi-Tenant-Policies' as result;