-- Vereinfachte Rechtematrix-Tabellen

-- Haupttabelle für Module und Submodule
CREATE TABLE IF NOT EXISTS public.permission_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  parent_module_id UUID REFERENCES public.permission_modules(id),
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabelle für die detaillierte Rechtematrix
CREATE TABLE IF NOT EXISTS public.role_permission_matrix (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role public.user_role NOT NULL,
  module_id UUID NOT NULL REFERENCES public.permission_modules(id) ON DELETE CASCADE,
  
  -- Sichtbarkeit und grundlegende Aktionen
  is_visible BOOLEAN DEFAULT false,
  allowed_actions TEXT[] DEFAULT '{}',
  
  -- Felder-spezifische Berechtigungen (JSON)
  visible_fields JSONB DEFAULT '{}',
  editable_fields JSONB DEFAULT '{}',
  
  -- Notification-Einstellungen
  allowed_notifications TEXT[] DEFAULT '{}',
  
  -- Workflow-Trigger
  workflow_triggers TEXT[] DEFAULT '{}',
  
  -- Zusätzliche Metadaten
  conditions JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  UNIQUE(role, module_id)
);

-- Tabelle für benutzerspezifische Überschreibungen
CREATE TABLE IF NOT EXISTS public.user_permission_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  module_id UUID NOT NULL REFERENCES public.permission_modules(id) ON DELETE CASCADE,
  
  override_data JSONB NOT NULL DEFAULT '{}',
  reason TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  UNIQUE(user_id, module_id)
);

-- Tabelle für Audit-Log der Berechtigungsänderungen
CREATE TABLE IF NOT EXISTS public.permission_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  role public.user_role,
  module_id UUID REFERENCES public.permission_modules(id),
  
  action_type TEXT NOT NULL,
  old_permissions JSONB,
  new_permissions JSONB,
  
  changed_by UUID,
  reason TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indizes für Performance
CREATE INDEX IF NOT EXISTS idx_role_permission_matrix_role ON public.role_permission_matrix(role);
CREATE INDEX IF NOT EXISTS idx_role_permission_matrix_module ON public.role_permission_matrix(module_id);
CREATE INDEX IF NOT EXISTS idx_user_permission_overrides_user ON public.user_permission_overrides(user_id);
CREATE INDEX IF NOT EXISTS idx_permission_audit_log_user ON public.permission_audit_log(user_id);

-- RLS aktivieren
ALTER TABLE public.permission_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permission_matrix ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_permission_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permission_audit_log ENABLE ROW LEVEL SECURITY;

-- Basis-Policies (ohne komplexe Subqueries)
CREATE POLICY "Enable read access for all users" ON public.permission_modules FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON public.role_permission_matrix FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON public.user_permission_overrides FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON public.permission_audit_log FOR SELECT USING (true);