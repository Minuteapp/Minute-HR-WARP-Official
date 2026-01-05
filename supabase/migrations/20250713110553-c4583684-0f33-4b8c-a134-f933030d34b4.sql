-- LÖSUNG: Verwende ein anderes Approach für Tenant-Isolation
-- Erstelle eine Tabelle für aktuelle Tenant-Sessions pro User

CREATE TABLE IF NOT EXISTS public.user_tenant_sessions (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  is_tenant_mode BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_tenant_sessions ENABLE ROW LEVEL SECURITY;

-- Users can only manage their own session
CREATE POLICY "Users can manage their own tenant session" 
ON public.user_tenant_sessions FOR ALL 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Verbesserte Funktion um die aktuelle Tenant-Company-ID zu bekommen
CREATE OR REPLACE FUNCTION public.get_current_tenant_company_id()
RETURNS uuid
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $$
DECLARE
  tenant_company_id UUID;
BEGIN
  -- Prüfe User-Session für Tenant-Modus
  SELECT uts.tenant_company_id
  INTO tenant_company_id
  FROM public.user_tenant_sessions uts
  WHERE uts.user_id = auth.uid() 
  AND uts.is_tenant_mode = true;
  
  IF tenant_company_id IS NOT NULL THEN
    RETURN tenant_company_id;
  END IF;
  
  -- Fallback: get_user_company_id 
  RETURN get_user_company_id(auth.uid());
END;
$$;

-- Verbesserte Funktion für Super-Admin-Context
CREATE OR REPLACE FUNCTION public.is_in_superadmin_context()
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $$
DECLARE
  is_tenant_mode BOOLEAN := false;
BEGIN
  -- Prüfe ob User im Tenant-Modus ist
  SELECT uts.is_tenant_mode
  INTO is_tenant_mode
  FROM public.user_tenant_sessions uts
  WHERE uts.user_id = auth.uid();
  
  -- Wenn im Tenant-Modus, dann NICHT im Super-Admin-Context
  IF is_tenant_mode = true THEN
    RETURN false;
  END IF;
  
  -- Sonst: Normal Super-Admin Check
  RETURN is_superadmin(auth.uid());
END;
$$;