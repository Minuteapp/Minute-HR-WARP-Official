-- =============================================
-- SETTINGS-DRIVEN ARCHITECTURE - Phase 2
-- Tabellen, RLS-Policies und Seed-Daten
-- =============================================

-- =============================================
-- TABELLE 1: settings_definitions
-- Metadaten aller verfügbaren Einstellungen
-- =============================================
CREATE TABLE public.settings_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module TEXT NOT NULL,
  submodule TEXT,
  key TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  value_type TEXT NOT NULL CHECK (value_type IN ('boolean', 'number', 'string', 'enum', 'json')),
  default_value JSONB NOT NULL,
  allowed_values JSONB,
  min_value NUMERIC,
  max_value NUMERIC,
  is_required BOOLEAN DEFAULT true,
  affected_features TEXT[],
  category TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(module, key)
);

-- =============================================
-- TABELLE 2: settings_values
-- Konkrete Werte pro Scope (Vererbungshierarchie)
-- =============================================
CREATE TABLE public.settings_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  definition_id UUID REFERENCES public.settings_definitions(id) ON DELETE CASCADE,
  module TEXT NOT NULL,
  key TEXT NOT NULL,
  value JSONB NOT NULL,
  scope_level TEXT NOT NULL CHECK (scope_level IN ('global', 'company', 'location', 'department', 'team', 'role', 'user')),
  scope_entity_id UUID,
  scope_entity_name TEXT,
  inheritance_mode TEXT DEFAULT 'inherit' CHECK (inheritance_mode IN ('inherit', 'override', 'locked')),
  effective_from TIMESTAMPTZ,
  effective_to TIMESTAMPTZ,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_by UUID,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index für schnelle Abfragen
CREATE INDEX idx_settings_values_module_key ON public.settings_values(module, key);
CREATE INDEX idx_settings_values_scope ON public.settings_values(scope_level, scope_entity_id);
CREATE INDEX idx_settings_values_definition ON public.settings_values(definition_id);

-- =============================================
-- TABELLE 3: settings_audit_log
-- Änderungsprotokoll für Compliance
-- =============================================
CREATE TABLE public.settings_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_value_id UUID REFERENCES public.settings_values(id) ON DELETE SET NULL,
  definition_id UUID REFERENCES public.settings_definitions(id) ON DELETE SET NULL,
  module TEXT NOT NULL,
  key TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('create', 'update', 'delete')),
  old_value JSONB,
  new_value JSONB,
  old_inheritance_mode TEXT,
  new_inheritance_mode TEXT,
  scope_level TEXT NOT NULL,
  scope_entity_id UUID,
  scope_entity_name TEXT,
  changed_by UUID,
  changed_by_name TEXT,
  changed_at TIMESTAMPTZ DEFAULT now(),
  reason TEXT,
  ip_address INET
);

-- Index für Audit-Abfragen
CREATE INDEX idx_settings_audit_log_module ON public.settings_audit_log(module, key);
CREATE INDEX idx_settings_audit_log_changed_at ON public.settings_audit_log(changed_at DESC);
CREATE INDEX idx_settings_audit_log_changed_by ON public.settings_audit_log(changed_by);

-- =============================================
-- RLS POLICIES
-- =============================================

-- Definitions: Alle können lesen, Manager können ändern
ALTER TABLE public.settings_definitions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "settings_definitions_select" 
  ON public.settings_definitions 
  FOR SELECT 
  USING (true);

CREATE POLICY "settings_definitions_all" 
  ON public.settings_definitions 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND is_manager = true
    )
  );

-- Values: Alle angemeldeten Benutzer können relevante Settings sehen
ALTER TABLE public.settings_values ENABLE ROW LEVEL SECURITY;

-- Globale Settings für alle sichtbar
CREATE POLICY "settings_values_select_global" 
  ON public.settings_values 
  FOR SELECT 
  USING (scope_level = 'global');

-- User-Settings nur für den Benutzer selbst
CREATE POLICY "settings_values_select_user" 
  ON public.settings_values 
  FOR SELECT 
  USING (scope_level = 'user' AND scope_entity_id = auth.uid());

-- Company/Location/Department/Team/Role Settings für angemeldete Benutzer
CREATE POLICY "settings_values_select_other" 
  ON public.settings_values 
  FOR SELECT 
  USING (
    scope_level IN ('company', 'location', 'department', 'team', 'role')
    AND auth.uid() IS NOT NULL
  );

-- Manager können alle Values verwalten
CREATE POLICY "settings_values_all" 
  ON public.settings_values 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND is_manager = true
    )
  );

-- Audit Log: Manager können lesen, System kann schreiben
ALTER TABLE public.settings_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "settings_audit_log_select" 
  ON public.settings_audit_log 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND is_manager = true
    )
  );

CREATE POLICY "settings_audit_log_insert" 
  ON public.settings_audit_log 
  FOR INSERT 
  WITH CHECK (true);

-- =============================================
-- TRIGGER: Automatisches Audit-Logging
-- =============================================
CREATE OR REPLACE FUNCTION public.log_settings_change()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.settings_audit_log (
      setting_value_id, definition_id, module, key, action,
      new_value, new_inheritance_mode, scope_level, scope_entity_id,
      scope_entity_name, changed_by
    ) VALUES (
      NEW.id, NEW.definition_id, NEW.module, NEW.key, 'create',
      NEW.value, NEW.inheritance_mode, NEW.scope_level, NEW.scope_entity_id,
      NEW.scope_entity_name, NEW.created_by
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.settings_audit_log (
      setting_value_id, definition_id, module, key, action,
      old_value, new_value, old_inheritance_mode, new_inheritance_mode,
      scope_level, scope_entity_id, scope_entity_name, changed_by
    ) VALUES (
      NEW.id, NEW.definition_id, NEW.module, NEW.key, 'update',
      OLD.value, NEW.value, OLD.inheritance_mode, NEW.inheritance_mode,
      NEW.scope_level, NEW.scope_entity_id, NEW.scope_entity_name, NEW.updated_by
    );
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.settings_audit_log (
      setting_value_id, definition_id, module, key, action,
      old_value, old_inheritance_mode, scope_level, scope_entity_id,
      scope_entity_name
    ) VALUES (
      OLD.id, OLD.definition_id, OLD.module, OLD.key, 'delete',
      OLD.value, OLD.inheritance_mode, OLD.scope_level, OLD.scope_entity_id,
      OLD.scope_entity_name
    );
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER settings_values_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.settings_values
  FOR EACH ROW EXECUTE FUNCTION public.log_settings_change();

-- =============================================
-- TRIGGER: updated_at automatisch aktualisieren
-- =============================================
CREATE TRIGGER update_settings_definitions_updated_at
  BEFORE UPDATE ON public.settings_definitions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_settings_values_updated_at
  BEFORE UPDATE ON public.settings_values
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- SEED-DATEN: Initiale Einstellungsdefinitionen
-- =============================================

-- ZEITERFASSUNG Module
INSERT INTO public.settings_definitions (module, submodule, key, name, description, value_type, default_value, affected_features, category, sort_order) VALUES
('timetracking', 'booking', 'manual_booking_allowed', 'Manuelle Nachbuchung erlaubt', 'Erlaubt Mitarbeitern, Arbeitszeiten manuell nachzutragen', 'boolean', 'true', ARRAY['time_entry', 'manual_booking_button', 'chatbot_booking'], 'Buchungen', 1),
('timetracking', 'booking', 'future_booking_allowed', 'Buchungen in der Zukunft erlaubt', 'Erlaubt das Eintragen von Arbeitszeiten für zukünftige Tage', 'boolean', 'false', ARRAY['time_entry', 'calendar_booking'], 'Buchungen', 2),
('timetracking', 'booking', 'max_retroactive_days', 'Maximale Nachbuchungstage', 'Wie viele Tage in der Vergangenheit darf nachgebucht werden', 'number', '7', ARRAY['time_entry', 'validation'], 'Buchungen', 3),
('timetracking', 'breaks', 'break_tracking_mode', 'Pausenerfassungsmodus', 'Wie werden Pausen erfasst: automatisch, manuell oder gemischt', 'enum', '"automatic"', ARRAY['break_entry', 'break_display'], 'Pausen', 10),
('timetracking', 'breaks', 'min_break_duration', 'Mindestpausendauer (Minuten)', 'Minimale Dauer einer Pause in Minuten', 'number', '30', ARRAY['break_validation', 'compliance'], 'Pausen', 11),
('timetracking', 'breaks', 'auto_break_after_hours', 'Automatische Pause nach Stunden', 'Nach wie vielen Arbeitsstunden wird automatisch eine Pause eingetragen', 'number', '6', ARRAY['auto_break', 'compliance'], 'Pausen', 12),
('timetracking', 'approval', 'approval_required', 'Genehmigung erforderlich', 'Müssen Zeitbuchungen genehmigt werden', 'boolean', 'false', ARRAY['approval_workflow', 'time_status'], 'Genehmigung', 20),
('timetracking', 'approval', 'auto_approval_threshold_hours', 'Auto-Genehmigung bis Stunden', 'Buchungen bis zu dieser Stundenanzahl werden automatisch genehmigt', 'number', '10', ARRAY['approval_workflow', 'auto_approval'], 'Genehmigung', 21),
('timetracking', 'overtime', 'overtime_allowed', 'Überstunden erlaubt', 'Dürfen Überstunden erfasst werden', 'boolean', 'true', ARRAY['overtime_entry', 'overtime_display'], 'Überstunden', 30),
('timetracking', 'overtime', 'overtime_approval_required', 'Überstunden-Genehmigung erforderlich', 'Müssen Überstunden genehmigt werden', 'boolean', 'true', ARRAY['overtime_approval', 'overtime_workflow'], 'Überstunden', 31),
('timetracking', 'display', 'show_colleague_times', 'Zeiten von Kollegen anzeigen', 'Können Mitarbeiter die Arbeitszeiten ihrer Kollegen sehen', 'boolean', 'false', ARRAY['team_calendar', 'colleague_view'], 'Anzeige', 40);

-- ABWESENHEIT Module
INSERT INTO public.settings_definitions (module, submodule, key, name, description, value_type, default_value, affected_features, category, sort_order) VALUES
('absence', 'request', 'self_approval_allowed', 'Selbstgenehmigung erlaubt', 'Können Mitarbeiter ihre eigenen Abwesenheiten genehmigen', 'boolean', 'false', ARRAY['absence_request', 'approval_flow'], 'Anträge', 1),
('absence', 'request', 'min_advance_days', 'Mindestvorlaufzeit (Tage)', 'Wie viele Tage im Voraus muss Urlaub beantragt werden', 'number', '3', ARRAY['absence_request', 'validation'], 'Anträge', 2),
('absence', 'request', 'max_consecutive_days', 'Maximale aufeinanderfolgende Tage', 'Maximale Anzahl aufeinanderfolgender Urlaubstage', 'number', '30', ARRAY['absence_request', 'validation'], 'Anträge', 3),
('absence', 'sickness', 'document_required_after_days', 'Attest erforderlich nach Tagen', 'Nach wie vielen Krankheitstagen ist ein ärztliches Attest erforderlich', 'number', '3', ARRAY['sickness_entry', 'document_upload'], 'Krankheit', 10),
('absence', 'sickness', 'auto_notify_hr', 'HR automatisch benachrichtigen', 'Soll HR bei Krankmeldungen automatisch benachrichtigt werden', 'boolean', 'true', ARRAY['sickness_notification', 'hr_alert'], 'Krankheit', 11),
('absence', 'display', 'show_team_absences', 'Team-Abwesenheiten anzeigen', 'Können Mitarbeiter die Abwesenheiten ihres Teams sehen', 'boolean', 'true', ARRAY['team_calendar', 'absence_overview'], 'Anzeige', 20),
('absence', 'display', 'show_absence_reasons', 'Abwesenheitsgründe anzeigen', 'Werden Abwesenheitsgründe für Kollegen sichtbar', 'boolean', 'false', ARRAY['absence_display', 'privacy'], 'Anzeige', 21),
('absence', 'quota', 'carryover_allowed', 'Urlaubsübertrag erlaubt', 'Darf Resturlaub ins nächste Jahr übertragen werden', 'boolean', 'true', ARRAY['quota_calculation', 'year_end'], 'Kontingent', 30),
('absence', 'quota', 'max_carryover_days', 'Maximaler Übertrag (Tage)', 'Wie viele Urlaubstage dürfen maximal übertragen werden', 'number', '5', ARRAY['quota_calculation', 'carryover'], 'Kontingent', 31);

-- AUFGABEN Module
INSERT INTO public.settings_definitions (module, submodule, key, name, description, value_type, default_value, affected_features, category, sort_order) VALUES
('tasks', 'assignment', 'assignment_restriction', 'Zuweisungsbeschränkung', 'Wer darf Aufgaben zuweisen: all, team_leads, managers', 'enum', '"all"', ARRAY['task_assignment', 'permission_check'], 'Zuweisung', 1),
('tasks', 'assignment', 'self_assignment_allowed', 'Selbstzuweisung erlaubt', 'Können Mitarbeiter sich selbst Aufgaben zuweisen', 'boolean', 'true', ARRAY['task_assignment', 'self_assign_button'], 'Zuweisung', 2),
('tasks', 'assignment', 'cross_team_assignment', 'Team-übergreifende Zuweisung', 'Dürfen Aufgaben an Mitarbeiter anderer Teams zugewiesen werden', 'boolean', 'false', ARRAY['task_assignment', 'team_filter'], 'Zuweisung', 3),
('tasks', 'deadlines', 'deadline_required', 'Deadline erforderlich', 'Muss jede Aufgabe eine Deadline haben', 'boolean', 'false', ARRAY['task_creation', 'validation'], 'Fristen', 10),
('tasks', 'deadlines', 'reminder_days_before', 'Erinnerung Tage vorher', 'Wie viele Tage vor der Deadline soll erinnert werden', 'number', '2', ARRAY['task_reminders', 'notifications'], 'Fristen', 11),
('tasks', 'display', 'show_all_tasks', 'Alle Aufgaben anzeigen', 'Können Mitarbeiter alle Aufgaben sehen oder nur zugewiesene', 'boolean', 'false', ARRAY['task_list', 'task_filter'], 'Anzeige', 20);

-- DASHBOARD Module
INSERT INTO public.settings_definitions (module, submodule, key, name, description, value_type, default_value, affected_features, category, sort_order) VALUES
('dashboard', 'widgets', 'show_time_widget', 'Zeiterfassungs-Widget anzeigen', 'Zeigt das Zeiterfassungs-Widget auf dem Dashboard', 'boolean', 'true', ARRAY['dashboard_layout', 'time_widget'], 'Widgets', 1),
('dashboard', 'widgets', 'show_absence_widget', 'Abwesenheits-Widget anzeigen', 'Zeigt das Abwesenheits-Widget auf dem Dashboard', 'boolean', 'true', ARRAY['dashboard_layout', 'absence_widget'], 'Widgets', 2),
('dashboard', 'widgets', 'show_tasks_widget', 'Aufgaben-Widget anzeigen', 'Zeigt das Aufgaben-Widget auf dem Dashboard', 'boolean', 'true', ARRAY['dashboard_layout', 'tasks_widget'], 'Widgets', 3),
('dashboard', 'shortcuts', 'quick_actions_enabled', 'Schnellaktionen aktiviert', 'Zeigt Schnellaktions-Buttons auf dem Dashboard', 'boolean', 'true', ARRAY['dashboard_shortcuts', 'quick_actions'], 'Schnellaktionen', 10);

-- KI/CHATBOT Module
INSERT INTO public.settings_definitions (module, submodule, key, name, description, value_type, default_value, affected_features, category, sort_order) VALUES
('ai', 'chatbot', 'chatbot_enabled', 'Chatbot aktiviert', 'Ist der KI-Chatbot verfügbar', 'boolean', 'true', ARRAY['chatbot_access', 'ai_assistant'], 'Chatbot', 1),
('ai', 'chatbot', 'can_execute_actions', 'Aktionen ausführen erlaubt', 'Darf der Chatbot Aktionen ausführen oder nur informieren', 'boolean', 'false', ARRAY['chatbot_actions', 'ai_execution'], 'Chatbot', 2),
('ai', 'suggestions', 'auto_suggestions_enabled', 'Automatische Vorschläge', 'Zeigt der Chatbot proaktiv Vorschläge an', 'boolean', 'true', ARRAY['ai_suggestions', 'proactive_help'], 'Vorschläge', 10),
('ai', 'privacy', 'data_collection_allowed', 'Datensammlung erlaubt', 'Dürfen Interaktionen zur Verbesserung der KI genutzt werden', 'boolean', 'false', ARRAY['ai_training', 'data_privacy'], 'Datenschutz', 20);

-- =============================================
-- SEED-DATEN: Globale Default-Werte
-- =============================================
INSERT INTO public.settings_values (definition_id, module, key, value, scope_level, scope_entity_name, inheritance_mode)
SELECT 
  id,
  module,
  key,
  default_value,
  'global',
  'System-Standard',
  'inherit'
FROM public.settings_definitions
WHERE is_active = true;