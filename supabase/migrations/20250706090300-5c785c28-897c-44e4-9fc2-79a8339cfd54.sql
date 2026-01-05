-- Erweiterte Rechtematrix-Tabellen für Enterprise-Level Permissions

-- Enum für erweiterte Aktionen
CREATE TYPE public.permission_action AS ENUM (
  'view', 'create', 'edit', 'delete', 'approve', 'export', 'archive', 
  'sign', 'upload', 'download', 'notify', 'correct', 'simulate', 
  'test', 'activate', 'manage'
);

-- Enum für Notification-Typen
CREATE TYPE public.notification_type AS ENUM (
  'push', 'email', 'sms', 'slack', 'teams'
);

-- Haupttabelle für Module und Submodule
CREATE TABLE public.permission_modules (
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
CREATE TABLE public.role_permission_matrix (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role public.user_role NOT NULL,
  module_id UUID NOT NULL REFERENCES public.permission_modules(id) ON DELETE CASCADE,
  
  -- Sichtbarkeit und grundlegende Aktionen
  is_visible BOOLEAN DEFAULT false,
  allowed_actions public.permission_action[] DEFAULT '{}',
  
  -- Felder-spezifische Berechtigungen (JSON)
  visible_fields JSONB DEFAULT '{}',
  editable_fields JSONB DEFAULT '{}',
  
  -- Notification-Einstellungen
  allowed_notifications public.notification_type[] DEFAULT '{}',
  
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
CREATE TABLE public.user_permission_overrides (
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
CREATE TABLE public.permission_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  role public.user_role,
  module_id UUID REFERENCES public.permission_modules(id),
  
  action_type TEXT NOT NULL, -- 'granted', 'revoked', 'modified'
  old_permissions JSONB,
  new_permissions JSONB,
  
  changed_by UUID,
  reason TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Trigger für updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_permission_modules_updated_at
    BEFORE UPDATE ON public.permission_modules
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_role_permission_matrix_updated_at
    BEFORE UPDATE ON public.role_permission_matrix
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Indizes für Performance
CREATE INDEX idx_role_permission_matrix_role ON public.role_permission_matrix(role);
CREATE INDEX idx_role_permission_matrix_module ON public.role_permission_matrix(module_id);
CREATE INDEX idx_user_permission_overrides_user ON public.user_permission_overrides(user_id);
CREATE INDEX idx_permission_audit_log_user ON public.permission_audit_log(user_id);

-- RLS Policies
ALTER TABLE public.permission_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permission_matrix ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_permission_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permission_audit_log ENABLE ROW LEVEL SECURITY;

-- Permission Modules: Admins können verwalten, alle können lesen
CREATE POLICY "Admins can manage permission modules"
ON public.permission_modules
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
);

CREATE POLICY "All can view active permission modules"
ON public.permission_modules
FOR SELECT
USING (is_active = true);

-- Role Permission Matrix: Nur Admins können verwalten
CREATE POLICY "Admins can manage role permission matrix"
ON public.role_permission_matrix
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
);

-- User Permission Overrides: Admins können verwalten, User können eigene sehen
CREATE POLICY "Admins can manage user permission overrides"
ON public.user_permission_overrides
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
);

CREATE POLICY "Users can view own permission overrides"
ON public.user_permission_overrides
FOR SELECT
USING (user_id = auth.uid());

-- Permission Audit Log: Nur Admins können sehen
CREATE POLICY "Admins can view permission audit log"
ON public.permission_audit_log
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
);

-- Funktion zum Abrufen der effektiven Berechtigungen eines Benutzers
CREATE OR REPLACE FUNCTION public.get_user_effective_permissions(p_user_id UUID)
RETURNS TABLE (
  module_name TEXT,
  module_id UUID,
  is_visible BOOLEAN,
  allowed_actions TEXT[],
  visible_fields JSONB,
  editable_fields JSONB,
  allowed_notifications TEXT[],
  workflow_triggers TEXT[]
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_role public.user_role;
BEGIN
  -- Hole die Rolle des Benutzers
  SELECT role INTO user_role 
  FROM public.user_roles 
  WHERE user_id = p_user_id 
  LIMIT 1;
  
  IF user_role IS NULL THEN
    user_role := 'employee'; -- Default-Rolle
  END IF;
  
  -- Gib die effektiven Berechtigungen zurück
  RETURN QUERY
  SELECT 
    pm.name as module_name,
    pm.id as module_id,
    COALESCE(rpm.is_visible, false) as is_visible,
    COALESCE(
      array(SELECT unnest(rpm.allowed_actions::TEXT[])), 
      ARRAY[]::TEXT[]
    ) as allowed_actions,
    COALESCE(rpm.visible_fields, '{}'::jsonb) as visible_fields,
    COALESCE(rpm.editable_fields, '{}'::jsonb) as editable_fields,
    COALESCE(
      array(SELECT unnest(rpm.allowed_notifications::TEXT[])), 
      ARRAY[]::TEXT[]
    ) as allowed_notifications,
    COALESCE(rpm.workflow_triggers, ARRAY[]::TEXT[]) as workflow_triggers
  FROM public.permission_modules pm
  LEFT JOIN public.role_permission_matrix rpm ON pm.id = rpm.module_id AND rpm.role = user_role
  WHERE pm.is_active = true
  ORDER BY pm.sort_order, pm.name;
END;
$$;