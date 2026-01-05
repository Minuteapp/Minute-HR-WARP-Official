-- Zentrale Organisationsstruktur-Tabellen
-- 1. Organisationseinheiten (hierarchische Struktur)
CREATE TABLE public.organizational_units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('area', 'department', 'team', 'location', 'subsidiary')),
  code TEXT UNIQUE,
  parent_id UUID REFERENCES public.organizational_units(id) ON DELETE CASCADE,
  level INTEGER NOT NULL DEFAULT 0,
  path TEXT[], -- Hierarchiepfad für Performance
  description TEXT,
  metadata JSONB DEFAULT '{}',
  
  -- Kontaktinformationen
  manager_id UUID,
  contact_email TEXT,
  phone TEXT,
  
  -- Physische Standortdaten
  address JSONB,
  coordinates JSONB,
  timezone TEXT DEFAULT 'Europe/Berlin',
  
  -- Organisatorische Daten
  cost_center TEXT,
  budget_code TEXT,
  legal_entity TEXT,
  
  -- Status und Gültigkeit
  is_active BOOLEAN DEFAULT true,
  valid_from DATE DEFAULT CURRENT_DATE,
  valid_until DATE,
  
  -- Berechtigungen und Sichtbarkeit
  visibility TEXT DEFAULT 'company' CHECK (visibility IN ('public', 'company', 'internal', 'restricted')),
  
  -- Audit-Felder
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID,
  updated_by UUID
);

-- 2. Organisationsrollen (Beziehungen zwischen Benutzern und Einheiten)
CREATE TABLE public.organizational_roles (
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
CREATE TABLE public.organizational_config (
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
CREATE INDEX idx_organizational_units_parent ON public.organizational_units(parent_id);
CREATE INDEX idx_organizational_units_type ON public.organizational_units(type);
CREATE INDEX idx_organizational_units_path ON public.organizational_units USING GIN(path);
CREATE INDEX idx_organizational_units_active ON public.organizational_units(is_active) WHERE is_active = true;
CREATE INDEX idx_organizational_roles_user ON public.organizational_roles(user_id);
CREATE INDEX idx_organizational_roles_unit ON public.organizational_roles(organizational_unit_id);
CREATE INDEX idx_organizational_roles_active ON public.organizational_roles(is_active) WHERE is_active = true;

-- Trigger für automatische Pfad-Berechnung
CREATE OR REPLACE FUNCTION update_organizational_path()
RETURNS TRIGGER AS $$
DECLARE
  parent_path TEXT[];
  parent_level INTEGER;
BEGIN
  IF NEW.parent_id IS NULL THEN
    NEW.path := ARRAY[NEW.id::TEXT];
    NEW.level := 0;
  ELSE
    SELECT path, level INTO parent_path, parent_level
    FROM public.organizational_units 
    WHERE id = NEW.parent_id;
    
    NEW.path := parent_path || NEW.id::TEXT;
    NEW.level := parent_level + 1;
  END IF;
  
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_organizational_path_trigger
  BEFORE INSERT OR UPDATE ON public.organizational_units
  FOR EACH ROW
  EXECUTE FUNCTION update_organizational_path();

-- Trigger für updated_at
CREATE OR REPLACE FUNCTION update_organizational_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_organizational_roles_updated_at
  BEFORE UPDATE ON public.organizational_roles
  FOR EACH ROW
  EXECUTE FUNCTION update_organizational_updated_at();

CREATE TRIGGER update_organizational_config_updated_at
  BEFORE UPDATE ON public.organizational_config
  FOR EACH ROW
  EXECUTE FUNCTION update_organizational_updated_at();

-- RLS Policies
ALTER TABLE public.organizational_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizational_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizational_config ENABLE ROW LEVEL SECURITY;

-- Policies für organizational_units
CREATE POLICY "Admins can manage organizational units"
ON public.organizational_units
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
);

CREATE POLICY "Users can view active organizational units"
ON public.organizational_units
FOR SELECT
USING (is_active = true);

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
('approval_workflows', '{"structural_changes": ["manager", "hr", "admin"], "role_assignments": ["manager", "hr"]}', 'Genehmigungsworkflows für strukturelle Änderungen', true);

-- Beispiel-Organisationsstruktur (Grundgerüst)
INSERT INTO public.organizational_units (name, type, code, description, is_active) VALUES
('Hauptstandort', 'location', 'HQ', 'Hauptstandort des Unternehmens', true),
('Vertrieb', 'area', 'SALES', 'Vertriebsbereich', true),
('Technik', 'area', 'TECH', 'Technischer Bereich', true),
('Verwaltung', 'area', 'ADMIN', 'Verwaltungsbereich', true);

-- Enable Realtime
ALTER TABLE public.organizational_units REPLICA IDENTITY FULL;
ALTER TABLE public.organizational_roles REPLICA IDENTITY FULL;

-- Add to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.organizational_units;
ALTER PUBLICATION supabase_realtime ADD TABLE public.organizational_roles;