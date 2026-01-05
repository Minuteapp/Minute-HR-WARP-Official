-- Nur erstellen was noch nicht existiert

-- Prüfe und erstelle Tabelle falls nicht vorhanden
CREATE TABLE IF NOT EXISTS public.user_tenant_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  tenant_company_id uuid,
  is_tenant_mode boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- RLS aktivieren falls noch nicht aktiviert
ALTER TABLE public.user_tenant_sessions ENABLE ROW LEVEL SECURITY;