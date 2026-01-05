-- Fehlende Tabellen für Organisationsstruktur hinzufügen

-- 2. Organisationsrollen (Beziehungen zwischen Benutzern und Einheiten)
CREATE TABLE IF NOT EXISTS public.organizational_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  organizational_unit_id UUID NOT NULL REFERENCES public.organizational_units(id) ON DELETE CASCADE,
  role_type TEXT NOT NULL CHECK (role_type IN ('manager', 'member', 'deputy', 'assistant', 'viewer')),
  
  -- Zusätzliche Rollendaten
  responsibilities JSONB DEFAULT '[]',
  permissions JSONB DEFAULT '{}',
  
  -- Gültigkeit
  valid_from DATE DEFAULT CURRENT_DATE,
  valid_until DATE,
  is_active BOOLEAN DEFAULT true,
  
  -- Audit-Felder
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  assigned_by UUID,
  
  UNIQUE(user_id, organizational_unit_id, role_type)
);

-- 3. Organisationsstruktur-Konfiguration
CREATE TABLE IF NOT EXISTS public.organizational_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_key TEXT UNIQUE NOT NULL,
  config_value JSONB NOT NULL,
  description TEXT,
  is_system BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID
);

-- Indizes für Performance
CREATE INDEX IF NOT EXISTS idx_organizational_roles_user ON public.organizational_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_organizational_roles_unit ON public.organizational_roles(organizational_unit_id);
CREATE INDEX IF NOT EXISTS idx_organizational_roles_active ON public.organizational_roles(is_active) WHERE is_active = true;

-- RLS Policies
ALTER TABLE public.organizational_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizational_config ENABLE ROW LEVEL SECURITY;

-- Policies für organizational_roles
CREATE POLICY "Admins can manage organizational roles"
ON public.organizational_roles
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
);

CREATE POLICY "Users can view their own organizational roles"
ON public.organizational_roles
FOR SELECT
USING (user_id = auth.uid());

-- Policies für organizational_config
CREATE POLICY "Admins can manage organizational config"
ON public.organizational_config
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
);

CREATE POLICY "Users can view non-system config"
ON public.organizational_config
FOR SELECT
USING (is_system = false);

-- Beispieldaten für die Grundkonfiguration
INSERT INTO public.organizational_config (config_key, config_value, description, is_system) VALUES
('hierarchy_levels', '{"area": 0, "department": 1, "team": 2, "location": 0, "subsidiary": 0}', 'Hierarchie-Ebenen für verschiedene Organisationstypen', true),
('default_permissions', '{"view": true, "edit": false, "manage": false}', 'Standard-Berechtigungen für neue Rollen', true),
('approval_workflows', '{"structural_changes": ["manager", "hr", "admin"], "role_assignments": ["manager", "hr"]}', 'Genehmigungsworkflows für strukturelle Änderungen', true)
ON CONFLICT (config_key) DO NOTHING;

-- Enable Realtime
ALTER TABLE public.organizational_roles REPLICA IDENTITY FULL;

-- Add to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.organizational_roles;