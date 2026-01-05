-- Repariere die Super-Admin-Funktion für korrekte Tenant-Isolation
CREATE OR REPLACE FUNCTION public.is_superadmin_safe(user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  -- Prüfe sowohl user_roles Tabelle als auch user_metadata
  SELECT COALESCE(
    (SELECT EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = $1 AND role = 'superadmin'
    )),
    (SELECT 
      CASE 
        WHEN raw_user_meta_data->>'role' = 'superadmin' THEN true
        WHEN user_metadata->>'role' = 'superadmin' THEN true
        ELSE false
      END
      FROM auth.users 
      WHERE id = $1
    ),
    false
  );
$function$;

-- Aktualisiere die Tenant-Context-Funktion für bessere Debugging
CREATE OR REPLACE FUNCTION public.is_in_tenant_context()
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  tenant_company_id UUID;
  current_user_id UUID;
BEGIN
  current_user_id := auth.uid();
  
  -- Hole aktuelle Tenant-Company aus Session
  SELECT uts.tenant_company_id
  INTO tenant_company_id
  FROM public.user_tenant_sessions uts
  WHERE uts.user_id = current_user_id 
  AND uts.is_tenant_mode = true;
  
  -- Debug-Log
  INSERT INTO public.debug_logs (message, data) 
  VALUES ('tenant_context_check', jsonb_build_object(
    'user_id', current_user_id,
    'tenant_company_id', tenant_company_id,
    'is_in_context', tenant_company_id IS NOT NULL
  )) ON CONFLICT DO NOTHING;
  
  -- Wenn Tenant-Company gesetzt ist, sind wir im Tenant-Kontext
  RETURN tenant_company_id IS NOT NULL;
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
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

CREATE POLICY "Admins can view debug logs" ON public.debug_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'superadmin')
    )
  );

-- Verbessere die Company Isolation Policy für bessere Tenant-Trennung
-- Beispiel für absence_requests (sollte für alle relevanten Tabellen gemacht werden)
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