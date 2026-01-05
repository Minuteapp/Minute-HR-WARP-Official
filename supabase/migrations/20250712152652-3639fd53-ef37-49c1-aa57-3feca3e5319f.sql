-- Erweitere die companies Tabelle um alle zusätzlichen Felder
ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS founding_date DATE,
ADD COLUMN IF NOT EXISTS company_size TEXT DEFAULT 'small',
ADD COLUMN IF NOT EXISTS industry TEXT,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS annual_revenue NUMERIC,
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'EUR',
ADD COLUMN IF NOT EXISTS legal_form TEXT,
ADD COLUMN IF NOT EXISTS commercial_register TEXT,
ADD COLUMN IF NOT EXISTS bank_name TEXT,
ADD COLUMN IF NOT EXISTS iban TEXT,
ADD COLUMN IF NOT EXISTS bic TEXT,
ADD COLUMN IF NOT EXISTS primary_contact_name TEXT,
ADD COLUMN IF NOT EXISTS primary_contact_title TEXT,
ADD COLUMN IF NOT EXISTS primary_contact_email TEXT,
ADD COLUMN IF NOT EXISTS primary_contact_phone TEXT,
ADD COLUMN IF NOT EXISTS billing_contact_name TEXT,
ADD COLUMN IF NOT EXISTS billing_contact_email TEXT,
ADD COLUMN IF NOT EXISTS technical_contact_name TEXT,
ADD COLUMN IF NOT EXISTS technical_contact_email TEXT,
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS onboarding_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS license_expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS max_users INTEGER DEFAULT 10,
ADD COLUMN IF NOT EXISTS max_storage_gb INTEGER DEFAULT 5,
ADD COLUMN IF NOT EXISTS enabled_modules JSONB DEFAULT '[]'::JSONB,
ADD COLUMN IF NOT EXISTS custom_features JSONB DEFAULT '{}'::JSONB,
ADD COLUMN IF NOT EXISTS billing_cycle TEXT DEFAULT 'monthly',
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS last_payment_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS contract_start_date DATE,
ADD COLUMN IF NOT EXISTS contract_end_date DATE,
ADD COLUMN IF NOT EXISTS auto_renewal BOOLEAN DEFAULT true;

-- Erstelle eine Tabelle für verfügbare Module und ihre Preise
CREATE TABLE IF NOT EXISTS public.company_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_name TEXT NOT NULL,
  module_key TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  base_price NUMERIC DEFAULT 0,
  price_per_user NUMERIC DEFAULT 0,
  is_core_module BOOLEAN DEFAULT false,
  category TEXT DEFAULT 'standard',
  icon TEXT,
  requires_modules TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Erstelle eine Tabelle für Firmen-spezifische Modul-Zuweisungen
CREATE TABLE IF NOT EXISTS public.company_module_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL,
  module_key TEXT NOT NULL,
  is_enabled BOOLEAN DEFAULT true,
  custom_price NUMERIC,
  enabled_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  enabled_by UUID,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(company_id, module_key)
);

-- Erstelle eine Tabelle für Lizenz-Historie
CREATE TABLE IF NOT EXISTS public.company_license_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL,
  action_type TEXT NOT NULL, -- 'module_enabled', 'module_disabled', 'subscription_changed', etc.
  module_key TEXT,
  old_value JSONB,
  new_value JSONB,
  performed_by UUID,
  performed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  notes TEXT
);

-- Erstelle eine Tabelle für Firmen-Mitarbeiter (separate von auth.users)
CREATE TABLE IF NOT EXISTS public.company_employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL,
  user_id UUID, -- Kann NULL sein für noch nicht aktivierte Accounts
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  position TEXT,
  department TEXT,
  employee_number TEXT,
  is_active BOOLEAN DEFAULT true,
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  invited_by UUID,
  activated_at TIMESTAMP WITH TIME ZONE,
  last_login_at TIMESTAMP WITH TIME ZONE,
  password_reset_required BOOLEAN DEFAULT true,
  temp_password_hash TEXT, -- Für temporäre Passwörter
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(company_id, email)
);

-- Füge Standard-Module hinzu
INSERT INTO public.company_modules (module_key, module_name, display_name, description, base_price, price_per_user, is_core_module, category, icon) VALUES
('user_management', 'Benutzerverwaltung', 'Benutzerverwaltung', 'Verwaltung von Benutzern und Rollen', 0, 0, true, 'core', 'users'),
('document_management', 'Dokumentenverwaltung', 'Dokumentenverwaltung', 'Speichern und Verwalten von Dokumenten', 15, 2, false, 'productivity', 'file-text'),
('absence_management', 'Abwesenheitsverwaltung', 'Abwesenheitsverwaltung', 'Urlaubsanträge und Krankmeldungen', 20, 3, false, 'hr', 'calendar'),
('time_tracking', 'Zeiterfassung', 'Zeiterfassung', 'Arbeitszeit-Tracking und Stundenzettel', 25, 4, false, 'productivity', 'clock'),
('project_management', 'Projektverwaltung', 'Projektverwaltung', 'Projekte und Aufgaben verwalten', 30, 5, false, 'productivity', 'briefcase'),
('reporting', 'Berichtswesen', 'Berichtswesen', 'Analytics und Reports', 35, 3, false, 'analytics', 'bar-chart'),
('crm', 'Kundenmanagement', 'CRM', 'Customer Relationship Management', 40, 6, false, 'sales', 'users'),
('accounting', 'Buchhaltung', 'Buchhaltung', 'Finanzbuchhaltung und Rechnungen', 50, 4, false, 'finance', 'calculator'),
('inventory', 'Lagerverwaltung', 'Lagerverwaltung', 'Bestände und Warenwirtschaft', 35, 3, false, 'operations', 'package'),
('ai_assistant', 'KI-Assistent', 'KI-Assistent', 'Automatisierung und KI-Features', 100, 10, false, 'ai', 'brain'),
('advanced_security', 'Erweiterte Sicherheit', 'Security Plus', '2FA, SSO und erweiterte Sicherheitsfeatures', 25, 2, false, 'security', 'shield'),
('api_access', 'API-Zugang', 'API-Zugang', 'REST API und Integrationen', 50, 5, false, 'integration', 'code')
ON CONFLICT (module_key) DO NOTHING;

-- Enable RLS
ALTER TABLE public.company_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_module_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_license_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_employees ENABLE ROW LEVEL SECURITY;

-- RLS Policies für Module (alle können lesen, nur Superadmins können schreiben)
CREATE POLICY "Everyone can view modules" ON public.company_modules FOR SELECT USING (true);
CREATE POLICY "Only superadmins can manage modules" ON public.company_modules 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'superadmin'
    )
  );

-- RLS Policies für Modul-Zuweisungen
CREATE POLICY "Admins can view company module assignments" ON public.company_module_assignments 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin')
    )
  );

CREATE POLICY "Only superadmins can manage module assignments" ON public.company_module_assignments 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'superadmin'
    )
  );

-- RLS Policies für Lizenz-Historie
CREATE POLICY "Admins can view license history" ON public.company_license_history 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin')
    )
  );

CREATE POLICY "Only superadmins can manage license history" ON public.company_license_history 
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'superadmin'
    )
  );

-- RLS Policies für Firmen-Mitarbeiter
CREATE POLICY "Admins can view company employees" ON public.company_employees 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin')
    )
  );

CREATE POLICY "Admins can manage company employees" ON public.company_employees 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin')
    )
  );

-- Trigger für updated_at Felder
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_company_modules_updated_at BEFORE UPDATE ON public.company_modules 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_company_module_assignments_updated_at BEFORE UPDATE ON public.company_module_assignments 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_company_employees_updated_at BEFORE UPDATE ON public.company_employees 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();