-- EINFACHE SICHERHEITSREPARATUR: Nur die kritischste Lücke schließen
-- Löst das Deadlock-Problem durch minimale, nicht-blockierende Änderungen

-- ===================================================================
-- SCHRITT 1: NUR DIE KRITISCHSTE POLICY ENTFERNEN
-- ===================================================================

-- Entferne nur die gefährlichste Policy, die ALLEN Zugang gibt
DROP POLICY IF EXISTS "Temporary open access for data recovery" ON companies;

-- ===================================================================  
-- SCHRITT 2: MINIMAL-SICHERE COMPANIES POLICY
-- ===================================================================

-- Nur eine einfache, sichere Policy für Companies
CREATE POLICY "Emergency Company Security"
ON public.companies
FOR SELECT
USING (
  -- SuperAdmin: Zugriff auf alles
  is_superadmin_safe(auth.uid()) OR
  -- Normale Benutzer: Nur ihre eigene Firma  
  id = (
    SELECT ur.company_id 
    FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid()
    LIMIT 1
  )
);

-- ===================================================================
-- SCHRITT 3: AUDIT LOG FÜR NOTFALL-REPARATUR
-- ===================================================================

INSERT INTO public.security_audit_logs (
  user_id, action, resource_type, resource_id, details, risk_level
) VALUES (
  auth.uid(), 
  'emergency_security_patch', 
  'companies_table', 
  'critical_policy_removal',
  jsonb_build_object(
    'issue', 'Removed CRITICAL "Temporary open access for data recovery" policy',
    'action', 'Emergency minimal security patch to prevent data leaks',
    'scope', 'Companies table SELECT access only',
    'status', 'Deadlock-safe emergency repair'
  ),
  'critical'
);

SELECT 'NOTFALL-PATCH ANGEWENDET ⚠️ - Kritischste Sicherheitslücke geschlossen' as emergency_status;