-- System Inventory Scans - Speichert Scan-Ergebnisse
CREATE TABLE public.system_inventory_scans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  scan_type TEXT NOT NULL,
  scan_timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  scan_duration_ms INTEGER,
  summary JSONB NOT NULL DEFAULT '{}',
  results JSONB NOT NULL DEFAULT '{}',
  defects_count INTEGER DEFAULT 0,
  metadata JSONB,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Inventory Defects - Identifizierte Defekte
CREATE TABLE public.inventory_defects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  scan_id UUID REFERENCES public.system_inventory_scans(id) ON DELETE CASCADE,
  defect_type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('P0', 'P1', 'P2')),
  component_type TEXT NOT NULL,
  component_name TEXT NOT NULL,
  description TEXT NOT NULL,
  file_path TEXT,
  line_number INTEGER,
  suggested_fix TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'acknowledged', 'fixed', 'wont_fix')),
  acknowledged_by UUID,
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  fixed_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Action Event Mappings - Dokumentiert Action-Event Beziehungen
CREATE TABLE public.action_event_mappings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  action_name TEXT NOT NULL,
  module TEXT NOT NULL,
  event_name TEXT,
  producer_file TEXT,
  producer_line INTEGER,
  verification_status TEXT NOT NULL DEFAULT 'unverified' CHECK (verification_status IN ('verified', 'unverified', 'no_event')),
  verified_by UUID,
  verified_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(action_name, event_name)
);

-- Settings Enforcement Points - Dokumentiert wo Settings enforced werden
CREATE TABLE public.settings_enforcement_points (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT NOT NULL,
  setting_module TEXT NOT NULL,
  enforcement_type TEXT NOT NULL CHECK (enforcement_type IN ('ui', 'api', 'effect', 'trigger', 'rls')),
  file_path TEXT NOT NULL,
  line_number INTEGER,
  enforcement_description TEXT,
  is_verified BOOLEAN DEFAULT false,
  verified_by UUID,
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(setting_key, file_path, enforcement_type)
);

-- Indexes für Performance
CREATE INDEX idx_inventory_defects_severity ON public.inventory_defects(severity);
CREATE INDEX idx_inventory_defects_status ON public.inventory_defects(status);
CREATE INDEX idx_inventory_defects_component_type ON public.inventory_defects(component_type);
CREATE INDEX idx_action_event_mappings_action ON public.action_event_mappings(action_name);
CREATE INDEX idx_action_event_mappings_module ON public.action_event_mappings(module);
CREATE INDEX idx_settings_enforcement_setting ON public.settings_enforcement_points(setting_key);
CREATE INDEX idx_system_inventory_scans_type ON public.system_inventory_scans(scan_type);
CREATE INDEX idx_system_inventory_scans_timestamp ON public.system_inventory_scans(scan_timestamp DESC);

-- RLS aktivieren
ALTER TABLE public.system_inventory_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_defects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.action_event_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings_enforcement_points ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Nur Superadmin Zugriff (über user_roles Tabelle)
CREATE POLICY "Superadmin full access on system_inventory_scans"
ON public.system_inventory_scans
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'superadmin'
  )
);

CREATE POLICY "Superadmin full access on inventory_defects"
ON public.inventory_defects
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'superadmin'
  )
);

CREATE POLICY "Superadmin full access on action_event_mappings"
ON public.action_event_mappings
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'superadmin'
  )
);

CREATE POLICY "Superadmin full access on settings_enforcement_points"
ON public.settings_enforcement_points
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'superadmin'
  )
);