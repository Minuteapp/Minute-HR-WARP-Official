-- Repariere die Super-Admin-Funktion mit korrekte ENUM-Behandlung
CREATE OR REPLACE FUNCTION public.is_superadmin_safe(user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  -- Prüfe sowohl user_roles Tabelle als auch user_metadata mit korrektem ENUM-Cast
  SELECT COALESCE(
    (SELECT EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = $1 AND role = 'superadmin'::user_role
    )),
    (SELECT 
      CASE 
        WHEN raw_user_meta_data->>'role' = 'superadmin' THEN true
        ELSE false
      END
      FROM auth.users 
      WHERE id = $1
    ),
    false
  );
$function$;

-- Erstelle Debug-Log-Tabelle falls sie nicht existiert
CREATE TABLE IF NOT EXISTS public.debug_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamp with time zone DEFAULT now(),
  message text NOT NULL,
  data jsonb DEFAULT '{}'
);

-- RLS für Debug-Logs
ALTER TABLE public.debug_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view debug logs" ON public.debug_logs;
CREATE POLICY "Admins can view debug logs" ON public.debug_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin'::user_role, 'superadmin'::user_role)
    )
  );

-- Verbessere die Company Isolation Policy - Nur für absence_requests als Beispiel
DROP POLICY IF EXISTS "Absence Company Isolation" ON public.absence_requests;

CREATE POLICY "Absence Company Isolation" ON public.absence_requests
  FOR ALL
  USING (
    CASE 
      -- Im Tenant-Context: Nur Daten der spezifischen Firma anzeigen
      WHEN is_in_tenant_context() THEN
        user_id IN (
          SELECT e.id FROM employees e 
          WHERE e.company_id = get_tenant_company_id_safe()
        )
      -- Super-Admin OHNE Tenant-Context: Alles sehen
      WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN
        true
      -- Normale Benutzer: Nur eigene Daten oder Firmendaten
      ELSE
        (user_id = auth.uid()) OR 
        (user_id IN (
          SELECT e.id FROM employees e 
          WHERE e.company_id = get_user_company_id(auth.uid()) 
          AND e.company_id IS NOT NULL
        ))
    END
  );