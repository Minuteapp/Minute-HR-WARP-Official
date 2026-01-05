-- =====================================================
-- ORGANIGRAMM-EINSTELLUNGEN TABELLEN
-- =====================================================

-- Haupttabelle für Organigramm-Einstellungen
CREATE TABLE public.orgchart_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  
  -- Strukturelle Grundlagen
  organization_type TEXT NOT NULL DEFAULT 'single_line' CHECK (organization_type IN ('single_line', 'matrix', 'hybrid')),
  max_hierarchy_depth INTEGER DEFAULT 10,
  allow_multiple_managers BOOLEAN DEFAULT false,
  show_deputies BOOLEAN DEFAULT true,
  show_vacant_positions BOOLEAN DEFAULT true,
  allow_temporary_structures BOOLEAN DEFAULT false,
  
  -- Abbildungseinheiten
  enabled_unit_types JSONB DEFAULT '["company", "location", "department", "team", "position", "person"]'::jsonb,
  unit_type_order JSONB DEFAULT '{"company": 1, "location": 2, "department": 3, "team": 4, "position": 5, "person": 6}'::jsonb,
  unit_type_weights JSONB DEFAULT '{}'::jsonb,
  
  -- Darstellungsoptionen
  default_layout TEXT DEFAULT 'tree_top_down' CHECK (default_layout IN ('tree_top_down', 'tree_left_right', 'radial', 'compact', 'detailed')),
  default_detail_level TEXT DEFAULT 'standard' CHECK (default_detail_level IN ('minimal', 'standard', 'detailed')),
  show_photos BOOLEAN DEFAULT true,
  show_contact_info BOOLEAN DEFAULT false,
  show_role_info BOOLEAN DEFAULT true,
  show_team_info BOOLEAN DEFAULT true,
  show_location_info BOOLEAN DEFAULT false,
  color_scheme TEXT DEFAULT 'by_department' CHECK (color_scheme IN ('by_department', 'by_company', 'by_status', 'custom')),
  custom_colors JSONB DEFAULT '{}'::jsonb,
  line_style_functional TEXT DEFAULT 'dashed',
  line_style_disciplinary TEXT DEFAULT 'solid',
  zoom_levels JSONB DEFAULT '{"min": 0.25, "max": 2, "default": 1}'::jsonb,
  enable_collapse_expand BOOLEAN DEFAULT true,
  
  -- Sichtbarkeit & Datenschutz
  anonymize_sensitive_data BOOLEAN DEFAULT false,
  anonymize_for_external BOOLEAN DEFAULT true,
  external_visibility_enabled BOOLEAN DEFAULT false,
  
  -- Pflege & Änderungslogik
  edit_source TEXT DEFAULT 'company_info_only' CHECK (edit_source IN ('company_info_only', 'explicit_approval', 'direct_edit')),
  require_approval_for_changes BOOLEAN DEFAULT true,
  allowed_change_roles JSONB DEFAULT '["hr", "admin", "superadmin"]'::jsonb,
  change_effective_date_required BOOLEAN DEFAULT false,
  
  -- Audit
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID,
  updated_by UUID,
  
  CONSTRAINT unique_company_orgchart_settings UNIQUE (company_id)
);

-- Tabelle für rollenbasierte Sichtbarkeitsregeln
CREATE TABLE public.orgchart_visibility_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  role_type TEXT NOT NULL CHECK (role_type IN ('employee', 'team_lead', 'department_head', 'hr', 'executive', 'admin', 'superadmin', 'external')),
  
  -- Sichtbarkeitsregeln
  can_view_levels_up INTEGER DEFAULT 999,
  can_view_levels_down INTEGER DEFAULT 999,
  can_view_siblings BOOLEAN DEFAULT true,
  can_view_other_departments BOOLEAN DEFAULT false,
  can_view_other_locations BOOLEAN DEFAULT false,
  can_view_vacant_positions BOOLEAN DEFAULT false,
  
  -- Detailstufe
  detail_level TEXT DEFAULT 'standard' CHECK (detail_level IN ('minimal', 'standard', 'detailed', 'full')),
  visible_fields JSONB DEFAULT '["name", "role", "team"]'::jsonb,
  hidden_fields JSONB DEFAULT '[]'::jsonb,
  
  -- Berechtigungen
  can_export BOOLEAN DEFAULT false,
  can_print BOOLEAN DEFAULT false,
  can_search BOOLEAN DEFAULT true,
  can_edit BOOLEAN DEFAULT false,
  can_manage_structure BOOLEAN DEFAULT false,
  
  -- Audit
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  CONSTRAINT unique_company_role_visibility UNIQUE (company_id, role_type)
);

-- =====================================================
-- ASSET-EINSTELLUNGEN TABELLEN
-- =====================================================

-- Asset-Typen Definition
CREATE TABLE public.asset_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  
  -- Grunddaten
  name TEXT NOT NULL,
  code TEXT,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('it_hardware', 'accessory', 'vehicle', 'access_media', 'work_tool', 'software_license', 'furniture', 'other')),
  icon TEXT,
  color TEXT,
  
  -- Konfiguration
  require_serial_number BOOLEAN DEFAULT false,
  require_inventory_number BOOLEAN DEFAULT true,
  track_value BOOLEAN DEFAULT true,
  track_warranty BOOLEAN DEFAULT true,
  depreciation_method TEXT DEFAULT 'linear' CHECK (depreciation_method IN ('linear', 'declining', 'none')),
  depreciation_years INTEGER DEFAULT 3,
  maintenance_interval_days INTEGER,
  maintenance_reminder_days INTEGER DEFAULT 14,
  
  -- Benutzerdefinierte Attribute
  custom_attributes JSONB DEFAULT '[]'::jsonb,
  required_attributes JSONB DEFAULT '[]'::jsonb,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  
  -- Audit
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID,
  
  CONSTRAINT unique_company_asset_type_name UNIQUE (company_id, name)
);

-- Haupttabelle für Asset-Einstellungen
CREATE TABLE public.asset_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  
  -- Inventarnummer-Generierung
  auto_generate_inventory_number BOOLEAN DEFAULT true,
  inventory_number_prefix TEXT DEFAULT 'INV',
  inventory_number_format TEXT DEFAULT '{prefix}-{year}-{sequence}',
  inventory_number_sequence INTEGER DEFAULT 1,
  
  -- Barcode/QR
  enable_barcode BOOLEAN DEFAULT true,
  barcode_format TEXT DEFAULT 'CODE128',
  enable_qr_code BOOLEAN DEFAULT true,
  qr_code_content TEXT DEFAULT 'inventory_number',
  
  -- Zuweisungsregeln
  assignment_targets JSONB DEFAULT '["employee", "role", "team", "location", "pool"]'::jsonb,
  max_assets_per_user INTEGER,
  max_assets_per_type_per_user INTEGER,
  allow_multiple_assignment BOOLEAN DEFAULT false,
  require_assignment_confirmation BOOLEAN DEFAULT true,
  assignment_confirmation_days INTEGER DEFAULT 3,
  
  -- Lifecycle-Automatisierungen
  auto_assign_onboarding BOOLEAN DEFAULT true,
  auto_check_role_change BOOLEAN DEFAULT true,
  force_return_offboarding BOOLEAN DEFAULT true,
  auto_reassign_location_change BOOLEAN DEFAULT false,
  notify_before_warranty_end BOOLEAN DEFAULT true,
  warranty_notification_days INTEGER DEFAULT 30,
  
  -- Rückgabe-Einstellungen
  require_return_checklist BOOLEAN DEFAULT true,
  require_condition_report BOOLEAN DEFAULT true,
  require_damage_report BOOLEAN DEFAULT false,
  require_digital_confirmation BOOLEAN DEFAULT true,
  allow_self_return BOOLEAN DEFAULT false,
  escalation_enabled BOOLEAN DEFAULT true,
  escalation_days_overdue INTEGER DEFAULT 7,
  escalation_recipients JSONB DEFAULT '["hr", "manager"]'::jsonb,
  
  -- KI-Funktionen
  ai_suggestions_enabled BOOLEAN DEFAULT false,
  ai_unused_detection_enabled BOOLEAN DEFAULT false,
  ai_unused_threshold_days INTEGER DEFAULT 90,
  ai_maintenance_prediction_enabled BOOLEAN DEFAULT false,
  ai_cost_optimization_enabled BOOLEAN DEFAULT false,
  
  -- Compliance & Audit
  enable_full_audit_trail BOOLEAN DEFAULT true,
  retention_years INTEGER DEFAULT 10,
  enable_periodic_inventory BOOLEAN DEFAULT false,
  inventory_frequency_months INTEGER DEFAULT 12,
  
  -- Audit
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID,
  updated_by UUID,
  
  CONSTRAINT unique_company_asset_settings UNIQUE (company_id)
);

-- Assets Haupttabelle
CREATE TABLE public.assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  asset_type_id UUID REFERENCES public.asset_types(id) ON DELETE SET NULL,
  
  -- Identifikation
  inventory_number TEXT,
  barcode TEXT,
  qr_code TEXT,
  name TEXT NOT NULL,
  description TEXT,
  
  -- Hersteller & Modell
  manufacturer TEXT,
  model TEXT,
  serial_number TEXT,
  
  -- Kauf & Wert
  purchase_date DATE,
  purchase_price NUMERIC(12,2),
  current_value NUMERIC(12,2),
  currency TEXT DEFAULT 'EUR',
  supplier TEXT,
  invoice_number TEXT,
  
  -- Garantie & Wartung
  warranty_start DATE,
  warranty_end DATE,
  last_maintenance_date DATE,
  next_maintenance_date DATE,
  maintenance_notes TEXT,
  
  -- Standort & Zuordnung
  location_id UUID,
  cost_center TEXT,
  department TEXT,
  
  -- Zustand & Status
  condition TEXT DEFAULT 'good' CHECK (condition IN ('new', 'excellent', 'good', 'fair', 'poor', 'damaged', 'defective')),
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'assigned', 'in_repair', 'reserved', 'in_transit', 'disposed', 'lost', 'stolen')),
  
  -- Eigentümer
  owner_company_id UUID REFERENCES public.companies(id),
  
  -- Benutzerdefinierte Attribute
  custom_attributes JSONB DEFAULT '{}'::jsonb,
  tags JSONB DEFAULT '[]'::jsonb,
  
  -- Notizen & Dokumente
  notes TEXT,
  documents JSONB DEFAULT '[]'::jsonb,
  images JSONB DEFAULT '[]'::jsonb,
  
  -- Audit
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID,
  updated_by UUID,
  disposed_at TIMESTAMPTZ,
  disposed_by UUID,
  disposal_reason TEXT,
  
  CONSTRAINT unique_inventory_number UNIQUE (company_id, inventory_number)
);

-- Asset-Zuweisungen
CREATE TABLE public.asset_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  
  -- Zuweisung an
  assigned_to_type TEXT NOT NULL CHECK (assigned_to_type IN ('employee', 'role', 'team', 'location', 'department', 'pool')),
  assigned_to_id UUID NOT NULL,
  assigned_to_name TEXT,
  
  -- Zeitraum
  assigned_date DATE NOT NULL,
  expected_return_date DATE,
  actual_return_date DATE,
  
  -- Grund & Kontext
  assignment_reason TEXT,
  assignment_type TEXT DEFAULT 'permanent' CHECK (assignment_type IN ('permanent', 'temporary', 'project', 'replacement')),
  project_id UUID,
  
  -- Bestätigung
  confirmed_by_assignee BOOLEAN DEFAULT false,
  confirmed_at TIMESTAMPTZ,
  confirmation_notes TEXT,
  
  -- Rückgabe
  return_condition TEXT CHECK (return_condition IN ('excellent', 'good', 'fair', 'poor', 'damaged', 'defective')),
  return_notes TEXT,
  damage_notes TEXT,
  damage_cost NUMERIC(12,2),
  returned_confirmed BOOLEAN DEFAULT false,
  returned_confirmed_at TIMESTAMPTZ,
  returned_confirmed_by UUID,
  
  -- Checkliste
  return_checklist JSONB DEFAULT '[]'::jsonb,
  checklist_completed BOOLEAN DEFAULT false,
  
  -- Audit
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Pflicht-Assets pro Rolle
CREATE TABLE public.asset_role_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  
  -- Rolle
  role_name TEXT NOT NULL,
  role_id UUID,
  department TEXT,
  
  -- Asset-Anforderung
  asset_type_id UUID REFERENCES public.asset_types(id) ON DELETE CASCADE,
  is_mandatory BOOLEAN DEFAULT true,
  quantity INTEGER DEFAULT 1,
  
  -- Optionen
  allow_alternatives BOOLEAN DEFAULT false,
  alternative_asset_types JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Audit
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID,
  
  CONSTRAINT unique_role_asset_requirement UNIQUE (company_id, role_name, asset_type_id)
);

-- Asset-Rückgabe-Checklisten-Vorlagen
CREATE TABLE public.asset_return_checklists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  asset_type_id UUID REFERENCES public.asset_types(id) ON DELETE CASCADE,
  
  -- Checklist
  name TEXT NOT NULL,
  description TEXT,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  
  -- Audit
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID
);

-- =====================================================
-- INDIZES
-- =====================================================

CREATE INDEX idx_orgchart_settings_company ON public.orgchart_settings(company_id);
CREATE INDEX idx_orgchart_visibility_company ON public.orgchart_visibility_rules(company_id);
CREATE INDEX idx_orgchart_visibility_role ON public.orgchart_visibility_rules(role_type);

CREATE INDEX idx_asset_types_company ON public.asset_types(company_id);
CREATE INDEX idx_asset_types_category ON public.asset_types(category);
CREATE INDEX idx_asset_settings_company ON public.asset_settings(company_id);

CREATE INDEX idx_assets_company ON public.assets(company_id);
CREATE INDEX idx_assets_type ON public.assets(asset_type_id);
CREATE INDEX idx_assets_status ON public.assets(status);
CREATE INDEX idx_assets_inventory ON public.assets(inventory_number);
CREATE INDEX idx_assets_serial ON public.assets(serial_number);

CREATE INDEX idx_asset_assignments_asset ON public.asset_assignments(asset_id);
CREATE INDEX idx_asset_assignments_assignee ON public.asset_assignments(assigned_to_type, assigned_to_id);
CREATE INDEX idx_asset_assignments_dates ON public.asset_assignments(assigned_date, actual_return_date);

CREATE INDEX idx_asset_role_requirements_company ON public.asset_role_requirements(company_id);
CREATE INDEX idx_asset_role_requirements_role ON public.asset_role_requirements(role_name);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE public.orgchart_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orgchart_visibility_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_role_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_return_checklists ENABLE ROW LEVEL SECURITY;

-- Orgchart Settings Policies
CREATE POLICY "Users can read orgchart settings" ON public.orgchart_settings
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage orgchart settings" ON public.orgchart_settings
  FOR ALL USING (true);

-- Orgchart Visibility Rules Policies
CREATE POLICY "Users can read visibility rules" ON public.orgchart_visibility_rules
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage visibility rules" ON public.orgchart_visibility_rules
  FOR ALL USING (true);

-- Asset Types Policies
CREATE POLICY "Users can read asset types" ON public.asset_types
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage asset types" ON public.asset_types
  FOR ALL USING (true);

-- Asset Settings Policies
CREATE POLICY "Users can read asset settings" ON public.asset_settings
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage asset settings" ON public.asset_settings
  FOR ALL USING (true);

-- Assets Policies
CREATE POLICY "Users can read assets" ON public.assets
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage assets" ON public.assets
  FOR ALL USING (true);

-- Asset Assignments Policies
CREATE POLICY "Users can read assignments" ON public.asset_assignments
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage assignments" ON public.asset_assignments
  FOR ALL USING (true);

-- Asset Role Requirements Policies
CREATE POLICY "Users can read role requirements" ON public.asset_role_requirements
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage role requirements" ON public.asset_role_requirements
  FOR ALL USING (true);

-- Asset Return Checklists Policies
CREATE POLICY "Users can read checklists" ON public.asset_return_checklists
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage checklists" ON public.asset_return_checklists
  FOR ALL USING (true);

-- =====================================================
-- TRIGGER FÜR UPDATED_AT
-- =====================================================

CREATE TRIGGER update_orgchart_settings_updated_at
  BEFORE UPDATE ON public.orgchart_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orgchart_visibility_rules_updated_at
  BEFORE UPDATE ON public.orgchart_visibility_rules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_asset_types_updated_at
  BEFORE UPDATE ON public.asset_types
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_asset_settings_updated_at
  BEFORE UPDATE ON public.asset_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_assets_updated_at
  BEFORE UPDATE ON public.assets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_asset_assignments_updated_at
  BEFORE UPDATE ON public.asset_assignments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_asset_role_requirements_updated_at
  BEFORE UPDATE ON public.asset_role_requirements
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_asset_return_checklists_updated_at
  BEFORE UPDATE ON public.asset_return_checklists
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();