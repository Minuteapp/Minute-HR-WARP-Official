-- Einfache Rechtematrix-Tabellen ohne komplexe Referenzen

-- Haupttabelle für Module
CREATE TABLE IF NOT EXISTS public.permission_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Rechtematrix für Rollen
CREATE TABLE IF NOT EXISTS public.role_permission_matrix (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role TEXT NOT NULL,
  module_name TEXT NOT NULL,
  
  is_visible BOOLEAN DEFAULT false,
  allowed_actions TEXT[] DEFAULT '{}',
  visible_fields JSONB DEFAULT '{}',
  editable_fields JSONB DEFAULT '{}',
  allowed_notifications TEXT[] DEFAULT '{}',
  workflow_triggers TEXT[] DEFAULT '{}',
  conditions JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(role, module_name)
);

-- RLS deaktiviert für Entwicklung
ALTER TABLE public.permission_modules DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permission_matrix DISABLE ROW LEVEL SECURITY;