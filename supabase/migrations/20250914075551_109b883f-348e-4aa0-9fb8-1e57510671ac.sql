-- Erstelle fehlende Tenant-Funktionen für Multi-Tenant-Support

-- Tabelle für User-Tenant-Sessions falls sie nicht existiert
CREATE TABLE IF NOT EXISTS public.user_tenant_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  tenant_company_id uuid,
  is_tenant_mode boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Index für bessere Performance
CREATE INDEX IF NOT EXISTS idx_user_tenant_sessions_user_id ON public.user_tenant_sessions(user_id);

-- Funktion: Prüft ob User im Tenant-Modus ist
CREATE OR REPLACE FUNCTION public.is_in_tenant_context()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_tenant_sessions 
    WHERE user_id = auth.uid() 
    AND is_tenant_mode = true
    AND tenant_company_id IS NOT NULL
  );
END;
$$;

-- Funktion: Holt die aktuelle Tenant Company ID
CREATE OR REPLACE FUNCTION public.get_tenant_company_id_safe()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  tenant_id uuid;
BEGIN
  SELECT tenant_company_id INTO tenant_id
  FROM public.user_tenant_sessions 
  WHERE user_id = auth.uid() 
  AND is_tenant_mode = true
  AND tenant_company_id IS NOT NULL
  LIMIT 1;
  
  RETURN tenant_id;
END;
$$;

-- Funktion: Holt die Company ID des Users
CREATE OR REPLACE FUNCTION public.get_user_company_id(p_user_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  company_id uuid;
BEGIN
  -- Erst aus user_roles versuchen
  SELECT ur.company_id INTO company_id
  FROM public.user_roles ur
  WHERE ur.user_id = p_user_id
  LIMIT 1;
  
  -- Falls nicht gefunden, aus employees versuchen
  IF company_id IS NULL THEN
    SELECT e.company_id INTO company_id
    FROM public.employees e
    WHERE e.id = p_user_id
    LIMIT 1;
  END IF;
  
  RETURN company_id;
END;
$$;

-- Funktion: Setzt Tenant-Kontext für einen User
CREATE OR REPLACE FUNCTION public.set_tenant_context_with_user_id(p_company_id uuid, p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Lösche vorherige Sessions für diesen User
  DELETE FROM public.user_tenant_sessions 
  WHERE user_id = p_user_id;
  
  -- Erstelle neue Tenant-Session
  INSERT INTO public.user_tenant_sessions (
    user_id, 
    tenant_company_id, 
    is_tenant_mode
  ) VALUES (
    p_user_id, 
    p_company_id, 
    true
  );
END;
$$;

-- Funktion: Löscht Tenant-Kontext für einen User
CREATE OR REPLACE FUNCTION public.clear_tenant_context_with_user_id(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Lösche alle Tenant-Sessions für diesen User
  DELETE FROM public.user_tenant_sessions 
  WHERE user_id = p_user_id;
END;
$$;

-- RLS für user_tenant_sessions
ALTER TABLE public.user_tenant_sessions ENABLE ROW LEVEL SECURITY;

-- Policy: Users können nur ihre eigenen Sessions sehen
CREATE POLICY "Users can view own tenant sessions" 
ON public.user_tenant_sessions 
FOR SELECT 
USING (user_id = auth.uid());

-- Policy: Users können ihre eigenen Sessions verwalten
CREATE POLICY "Users can manage own tenant sessions" 
ON public.user_tenant_sessions 
FOR ALL 
USING (user_id = auth.uid());