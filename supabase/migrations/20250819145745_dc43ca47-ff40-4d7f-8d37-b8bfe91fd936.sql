-- 1. Vordefinierte System-Policies erstellen
INSERT INTO public.system_policies (
  policy_key, policy_category, policy_name, policy_description, 
  is_active, policy_value, affected_modules, required_roles, priority
) VALUES 
-- Sicherheits-Policies
(
  'mfa_required', 'security', 'Multi-Faktor-Authentifizierung erforderlich',
  'Alle Benutzer müssen MFA aktiviert haben, um auf sensitive Module zuzugreifen',
  true, 
  '{"enforce_for_modules": ["documents", "settings", "payroll"], "grace_period_days": 7}',
  ARRAY['documents', 'settings', 'payroll', 'business_travel'],
  ARRAY['employee', 'manager', 'hr', 'admin'],
  10
),
(
  'qr_code_mandatory', 'timetracking', 'QR-Code-Scan für Zeiterfassung verpflichtend',
  'Mitarbeiter müssen einen gültigen QR-Code scannen für Check-In/Out',
  true,
  '{"require_for_actions": ["time_check_in", "time_check_out"], "allow_manual_override": false}',
  ARRAY['timetracking'],
  ARRAY['employee', 'manager'],
  8
),
(
  'location_verification_required', 'timetracking', 'Standortverifikation erforderlich',
  'Zeiterfassung nur an genehmigten Standorten erlaubt',
  true,
  '{"allowed_radius_meters": 100, "require_gps": true, "fallback_wifi_check": true}',
  ARRAY['timetracking', 'absence'],
  ARRAY['employee', 'manager'],
  7
),
(
  'document_classification_mandatory', 'documents', 'Dokument-Klassifizierung verpflichtend',
  'Alle hochgeladenen Dokumente müssen klassifiziert werden',
  true,
  '{"require_sensitivity_level": true, "require_retention_policy": true}',
  ARRAY['documents'],
  ARRAY['employee', 'manager', 'hr'],
  6
),
(
  'absence_approval_workflow', 'absence', 'Mehrstufiger Genehmigungsworkflow für Abwesenheiten',
  'Abwesenheitsanträge durchlaufen automatischen Genehmigungsprozess',
  true,
  '{"min_advance_days": 14, "require_manager_approval": true, "require_hr_approval_over_days": 10}',
  ARRAY['absence'],
  ARRAY['employee'],
  5
),
(
  'business_travel_budget_limits', 'business_travel', 'Reisekosten-Limits durchsetzen',
  'Automatische Prüfung von Reisekosten gegen Budget-Limits',
  true,
  '{"daily_limit_eur": 200, "accommodation_limit_eur": 150, "require_approval_over": 1000}',
  ARRAY['business_travel', 'expenses'],
  ARRAY['employee', 'manager'],
  4
),
(
  'audit_trail_retention', 'security', 'Audit-Log Aufbewahrungspflicht',
  'Alle Benutzeraktionen müssen für Compliance aufbewahrt werden',
  true,
  '{"retention_years": 7, "encrypt_logs": true, "automated_anonymization": false}',
  ARRAY['timetracking', 'absence', 'documents', 'business_travel', 'payroll'],
  ARRAY['employee', 'manager', 'hr', 'admin'],
  9
),
(
  'data_export_restrictions', 'security', 'Datenexport-Beschränkungen',
  'Einschränkungen für Datenexporte und Downloads',
  true,
  '{"require_approval": true, "log_all_exports": true, "watermark_documents": true}',
  ARRAY['documents', 'reports', 'payroll'],
  ARRAY['employee', 'manager', 'hr'],
  8
),

-- Compliance-Policies
(
  'gdpr_compliance_mode', 'security', 'DSGVO-Compliance-Modus',
  'Erweiterte DSGVO-Compliance-Prüfungen und Datenschutzmaßnahmen',
  true,
  '{"require_data_processing_consent": true, "automated_deletion": true, "audit_data_access": true}',
  ARRAY['documents', 'hr', 'payroll', 'timetracking'],
  ARRAY['employee', 'manager', 'hr', 'admin'],
  10
),
(
  'work_time_compliance_de', 'timetracking', 'Deutsche Arbeitszeitgesetze (ArbZG)',
  'Automatische Durchsetzung deutscher Arbeitszeitbestimmungen',
  true,
  '{"max_daily_hours": 10, "min_break_after_6h": 30, "min_rest_period": 11, "max_sunday_work_per_year": 26}',
  ARRAY['timetracking', 'absence'],
  ARRAY['employee', 'manager'],
  9
)

ON CONFLICT (policy_key) DO UPDATE SET
  policy_name = EXCLUDED.policy_name,
  policy_description = EXCLUDED.policy_description,
  policy_value = EXCLUDED.policy_value,
  updated_at = NOW();

-- 2. System Notifications Tabelle für Policy-Updates
CREATE TABLE IF NOT EXISTS public.system_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  notification_type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- 3. Policy Templates für häufige Konfigurationen
CREATE TABLE IF NOT EXISTS public.policy_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_name TEXT NOT NULL,
  template_description TEXT,
  template_category TEXT NOT NULL,
  policy_configuration JSONB NOT NULL,
  is_builtin BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vordefinierte Templates
INSERT INTO public.policy_templates (
  template_name, template_description, template_category, 
  policy_configuration, is_builtin
) VALUES
(
  'Sicherer Arbeitsplatz (Standard)', 
  'Grundlegende Sicherheitsrichtlinien für den Arbeitsplatz',
  'security',
  '{
    "policies": [
      {"key": "mfa_required", "active": true},
      {"key": "audit_trail_retention", "active": true},
      {"key": "data_export_restrictions", "active": true}
    ]
  }',
  true
),
(
  'Remote Work Compliance',
  'Spezielle Richtlinien für Remote-Arbeit und Home Office',
  'remote_work',
  '{
    "policies": [
      {"key": "location_verification_required", "active": false},
      {"key": "qr_code_mandatory", "active": false},
      {"key": "mfa_required", "active": true},
      {"key": "document_classification_mandatory", "active": true}
    ]
  }',
  true
),
(
  'Strenge Sicherheit (Finanzbereich)',
  'Erhöhte Sicherheitsanforderungen für sensible Bereiche',
  'high_security',
  '{
    "policies": [
      {"key": "mfa_required", "active": true},
      {"key": "qr_code_mandatory", "active": true},
      {"key": "location_verification_required", "active": true},
      {"key": "document_classification_mandatory", "active": true},
      {"key": "data_export_restrictions", "active": true},
      {"key": "audit_trail_retention", "active": true}
    ]
  }',
  true
),
(
  'DSGVO Plus Compliance',
  'Vollständige DSGVO-Compliance mit erweiterten Datenschutzmaßnahmen',
  'compliance',
  '{
    "policies": [
      {"key": "gdpr_compliance_mode", "active": true},
      {"key": "audit_trail_retention", "active": true},
      {"key": "data_export_restrictions", "active": true},
      {"key": "document_classification_mandatory", "active": true}
    ]
  }',
  true
);

-- Indexes für Performance
CREATE INDEX IF NOT EXISTS idx_system_notifications_user_unread ON public.system_notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_policy_templates_category ON public.policy_templates(template_category);

-- RLS Policies
ALTER TABLE public.system_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.policy_templates ENABLE ROW LEVEL SECURITY;

-- System Notifications RLS
CREATE POLICY "Users can view their own notifications" ON public.system_notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications" ON public.system_notifications  
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can mark notifications as read" ON public.system_notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy Templates RLS  
CREATE POLICY "Everyone can view builtin templates" ON public.policy_templates
  FOR SELECT USING (is_builtin = true);

CREATE POLICY "Admins can manage all templates" ON public.policy_templates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'superadmin')
    )
  );

CREATE POLICY "Users can create custom templates" ON public.policy_templates
  FOR INSERT WITH CHECK (auth.uid() = created_by);