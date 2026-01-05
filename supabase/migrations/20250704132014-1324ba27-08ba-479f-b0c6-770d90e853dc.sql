-- Zuerst alle Types erstellen
DO $$ BEGIN
    CREATE TYPE permission_action AS ENUM (
      'view', 'create', 'edit', 'delete', 'export', 'approve', 'sign', 'archive', 'audit', 'manage'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE permission_scope AS ENUM (
      'own', 'team', 'department', 'location', 'global'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Bestehende Tabellen löschen falls vorhanden
DROP TABLE IF EXISTS permission_audit_log CASCADE;
DROP TABLE IF EXISTS user_permission_overrides CASCADE;
DROP TABLE IF EXISTS role_permissions CASCADE;
DROP TABLE IF EXISTS permission_ui_elements CASCADE;
DROP TABLE IF EXISTS permission_templates CASCADE;
DROP TABLE IF EXISTS permission_modules CASCADE;

-- Basis-Berechtigungssystem neu erstellen
CREATE TABLE permission_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  module_key TEXT UNIQUE NOT NULL,
  parent_module_id UUID,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Fremdschlüssel nachträglich hinzufügen
ALTER TABLE permission_modules 
ADD CONSTRAINT fk_parent_module 
FOREIGN KEY (parent_module_id) REFERENCES permission_modules(id);

-- UI-Elemente die gesteuert werden können
CREATE TABLE permission_ui_elements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES permission_modules(id) ON DELETE CASCADE,
  element_key TEXT NOT NULL,
  element_type TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Granulare Berechtigungen pro Rolle
CREATE TABLE role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role TEXT NOT NULL,
  module_id UUID NOT NULL REFERENCES permission_modules(id) ON DELETE CASCADE,
  action permission_action NOT NULL,
  scope permission_scope DEFAULT 'own',
  is_granted BOOLEAN DEFAULT false,
  conditions JSONB DEFAULT '{}',
  field_restrictions JSONB DEFAULT '{}',
  ui_restrictions JSONB DEFAULT '{}',
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(role, module_id, action, scope)
);

-- Benutzer-spezifische Überschreibungen
CREATE TABLE user_permission_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  module_id UUID NOT NULL REFERENCES permission_modules(id) ON DELETE CASCADE,
  action permission_action NOT NULL,
  scope permission_scope DEFAULT 'own',
  is_granted BOOLEAN DEFAULT false,
  conditions JSONB DEFAULT '{}',
  field_restrictions JSONB DEFAULT '{}',
  ui_restrictions JSONB DEFAULT '{}',
  granted_by UUID,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, module_id, action, scope)
);

-- Berechtigungs-Templates
CREATE TABLE permission_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  template_data JSONB NOT NULL,
  is_system_template BOOLEAN DEFAULT false,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Audit-Log für Berechtigungsänderungen
CREATE TABLE permission_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  old_values JSONB,
  new_values JSONB,
  changed_by UUID,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);