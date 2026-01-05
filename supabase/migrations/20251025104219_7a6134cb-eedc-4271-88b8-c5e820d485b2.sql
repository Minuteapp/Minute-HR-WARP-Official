-- Chat Commands System: Tables, RLS, Indexes, Seed Data (Corrected Policies)

-- ============================================
-- 1. TABLES
-- ============================================

-- Command Registry
CREATE TABLE IF NOT EXISTS chat_commands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  command_key TEXT NOT NULL,
  command_triggers TEXT[] NOT NULL,
  label JSONB NOT NULL,
  description JSONB,
  roles_allowed TEXT[] NOT NULL,
  fields_schema JSONB NOT NULL,
  validation_rules JSONB,
  workflow_hooks JSONB,
  is_active BOOLEAN DEFAULT true,
  version TEXT DEFAULT 'v1',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, command_key)
);

-- Command Executions (Audit)
CREATE TABLE IF NOT EXISTS chat_command_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  command_id UUID REFERENCES chat_commands(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  channel_id UUID REFERENCES channels(id) ON DELETE CASCADE,
  command_key TEXT NOT NULL,
  payload JSONB NOT NULL,
  payload_hash TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  result JSONB,
  error_message TEXT,
  executed_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- Interactive Cards
CREATE TABLE IF NOT EXISTS chat_interactive_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
  command_id UUID REFERENCES chat_commands(id) ON DELETE SET NULL,
  command_execution_id UUID REFERENCES chat_command_executions(id) ON DELETE SET NULL,
  card_type TEXT NOT NULL,
  card_data JSONB NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'submitted', 'approved', 'rejected', 'cancelled')),
  submitted_by UUID,
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 2. RLS POLICIES
-- ============================================

ALTER TABLE chat_commands ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_command_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_interactive_cards ENABLE ROW LEVEL SECURITY;

-- chat_commands policies
CREATE POLICY "Users see commands for their tenant"
  ON chat_commands FOR SELECT
  USING (
    tenant_id = get_effective_company_id() OR 
    is_superadmin_safe(auth.uid()) OR
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND company_id = chat_commands.tenant_id 
      AND role IN ('admin', 'hr')
    )
  );

CREATE POLICY "Admins can manage commands"
  ON chat_commands FOR ALL
  USING (
    (tenant_id = get_effective_company_id() OR is_superadmin_safe(auth.uid()))
    AND EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND company_id = chat_commands.tenant_id 
      AND role IN ('admin', 'hr')
    )
  );

-- chat_command_executions policies
CREATE POLICY "Users see their own executions"
  ON chat_command_executions FOR SELECT
  USING (
    tenant_id = get_effective_company_id() AND 
    (
      user_id = auth.uid() OR 
      is_superadmin_safe(auth.uid()) OR
      EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_id = auth.uid() 
        AND company_id = chat_command_executions.tenant_id 
        AND role IN ('admin', 'hr')
      )
    )
  );

CREATE POLICY "Users can create executions"
  ON chat_command_executions FOR INSERT
  WITH CHECK (tenant_id = get_effective_company_id() AND user_id = auth.uid());

-- chat_interactive_cards policies
CREATE POLICY "Users see cards in their channels"
  ON chat_interactive_cards FOR SELECT
  USING (tenant_id = get_effective_company_id());

CREATE POLICY "Users can create cards"
  ON chat_interactive_cards FOR INSERT
  WITH CHECK (tenant_id = get_effective_company_id());

CREATE POLICY "Users can update their cards"
  ON chat_interactive_cards FOR UPDATE
  USING (tenant_id = get_effective_company_id());

-- ============================================
-- 3. INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_chat_commands_tenant ON chat_commands(tenant_id);
CREATE INDEX IF NOT EXISTS idx_chat_commands_key ON chat_commands(command_key);
CREATE INDEX IF NOT EXISTS idx_chat_commands_active ON chat_commands(is_active) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_chat_command_executions_tenant ON chat_command_executions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_chat_command_executions_user ON chat_command_executions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_command_executions_status ON chat_command_executions(status);

CREATE INDEX IF NOT EXISTS idx_chat_interactive_cards_message ON chat_interactive_cards(message_id);
CREATE INDEX IF NOT EXISTS idx_chat_interactive_cards_status ON chat_interactive_cards(status);

-- ============================================
-- 4. SEED DATA - Must-Have Commands
-- ============================================

-- /urlaub - Urlaubsantrag
INSERT INTO chat_commands (tenant_id, command_key, command_triggers, label, description, roles_allowed, fields_schema, validation_rules, workflow_hooks)
SELECT 
  c.id,
  'absence.request',
  ARRAY['/urlaub', '/vacation', '/leave'],
  '{"de": "Urlaub beantragen", "en": "Request vacation"}'::jsonb,
  '{"de": "Urlaubsantrag stellen mit automatischer Workflow-Integration", "en": "Submit vacation request with automatic workflow integration"}'::jsonb,
  ARRAY['employee', 'manager', 'hr'],
  '{
    "fields": [
      {"id": "from_date", "type": "date", "label": {"de": "Von", "en": "From"}, "required": true},
      {"id": "to_date", "type": "date", "label": {"de": "Bis", "en": "To"}, "required": true},
      {"id": "type", "type": "select", "label": {"de": "Art", "en": "Type"}, "options": [
        {"value": "vacation", "label": {"de": "Urlaub", "en": "Vacation"}},
        {"value": "special", "label": {"de": "Sonderurlaub", "en": "Special leave"}}
      ], "required": true},
      {"id": "note", "type": "textarea", "label": {"de": "Begründung", "en": "Reason"}}
    ]
  }'::jsonb,
  '{"maxDays": 30, "checkBalance": true, "conflictCheck": ["shifts", "meetings"]}'::jsonb,
  '{"on_submit": "absence.requested.start", "on_approve": "absence.approved.sync", "on_reject": "absence.rejected.notify"}'::jsonb
FROM companies c
ON CONFLICT (tenant_id, command_key) DO NOTHING;

-- /krank - Krankmeldung
INSERT INTO chat_commands (tenant_id, command_key, command_triggers, label, description, roles_allowed, fields_schema, validation_rules, workflow_hooks)
SELECT 
  c.id,
  'sickleave.report',
  ARRAY['/krank', '/sick', '/ill'],
  '{"de": "Krankmeldung", "en": "Report sick"}'::jsonb,
  '{"de": "Krankmeldung mit optionalem Attest-Upload", "en": "Report sick leave with optional certificate upload"}'::jsonb,
  ARRAY['employee', 'manager', 'hr'],
  '{
    "fields": [
      {"id": "from_date", "type": "date", "label": {"de": "Von", "en": "From"}, "required": true, "default": "today"},
      {"id": "to_date", "type": "date", "label": {"de": "Bis (geschätzt)", "en": "Until (estimated)"}, "required": false},
      {"id": "has_certificate", "type": "boolean", "label": {"de": "Attest vorhanden", "en": "Have certificate"}},
      {"id": "certificate", "type": "file", "label": {"de": "Attest hochladen", "en": "Upload certificate"}, "accept": ["image/*", "application/pdf"], "showIf": {"has_certificate": true}},
      {"id": "note", "type": "textarea", "label": {"de": "Anmerkung", "en": "Note"}}
    ]
  }'::jsonb,
  '{"requireCertificateAfter": 3}'::jsonb,
  '{"on_submit": "sickleave.created", "on_certificate_uploaded": "sickleave.certificate.verify"}'::jsonb
FROM companies c
ON CONFLICT (tenant_id, command_key) DO NOTHING;

-- /spesen - Spesenantrag
INSERT INTO chat_commands (tenant_id, command_key, command_triggers, label, description, roles_allowed, fields_schema, validation_rules, workflow_hooks)
SELECT 
  c.id,
  'expense.submit',
  ARRAY['/spesen', '/expense'],
  '{"de": "Spesen einreichen", "en": "Submit expense"}'::jsonb,
  '{"de": "Spesenbeleg mit OCR-Erkennung einreichen", "en": "Submit expense receipt with OCR recognition"}'::jsonb,
  ARRAY['employee', 'manager', 'finance'],
  '{
    "fields": [
      {"id": "receipt", "type": "file", "label": {"de": "Beleg", "en": "Receipt"}, "accept": ["image/*", "application/pdf"], "required": true, "ocr": true},
      {"id": "amount", "type": "money", "label": {"de": "Betrag", "en": "Amount"}, "prefill": "ocr.amount"},
      {"id": "date", "type": "date", "label": {"de": "Datum", "en": "Date"}, "prefill": "ocr.date"},
      {"id": "category", "type": "select", "label": {"de": "Kategorie", "en": "Category"}, "options": [
        {"value": "travel", "label": {"de": "Reise", "en": "Travel"}},
        {"value": "meal", "label": {"de": "Verpflegung", "en": "Meal"}},
        {"value": "hotel", "label": {"de": "Unterkunft", "en": "Accommodation"}},
        {"value": "other", "label": {"de": "Sonstiges", "en": "Other"}}
      ], "prefill": "ocr.category"},
      {"id": "project", "type": "entity", "entity_type": "project", "label": {"de": "Projekt", "en": "Project"}},
      {"id": "note", "type": "textarea", "label": {"de": "Beschreibung", "en": "Description"}}
    ]
  }'::jsonb,
  '{"maxAmount": 2000, "requireReceipt": true}'::jsonb,
  '{"on_submit": "expense.submitted", "on_ocr_complete": "expense.ocr.process", "on_approve": "expense.accounting.sync"}'::jsonb
FROM companies c
ON CONFLICT (tenant_id, command_key) DO NOTHING;

-- /aufgabe - Aufgabe erstellen
INSERT INTO chat_commands (tenant_id, command_key, command_triggers, label, description, roles_allowed, fields_schema, validation_rules, workflow_hooks)
SELECT 
  c.id,
  'task.create',
  ARRAY['/aufgabe', '/task', '/todo'],
  '{"de": "Aufgabe erstellen", "en": "Create task"}'::jsonb,
  '{"de": "Neue Aufgabe mit Zuordnung erstellen", "en": "Create new task with assignment"}'::jsonb,
  ARRAY['employee', 'manager', 'hr'],
  '{
    "fields": [
      {"id": "title", "type": "text", "label": {"de": "Titel", "en": "Title"}, "required": true},
      {"id": "assignee", "type": "user", "label": {"de": "Zugewiesen an", "en": "Assigned to"}},
      {"id": "due_date", "type": "date", "label": {"de": "Fällig am", "en": "Due date"}},
      {"id": "priority", "type": "select", "label": {"de": "Priorität", "en": "Priority"}, "options": [
        {"value": "low", "label": {"de": "Niedrig", "en": "Low"}},
        {"value": "medium", "label": {"de": "Mittel", "en": "Medium"}},
        {"value": "high", "label": {"de": "Hoch", "en": "High"}}
      ], "default": "medium"},
      {"id": "description", "type": "textarea", "label": {"de": "Beschreibung", "en": "Description"}}
    ]
  }'::jsonb,
  '{}'::jsonb,
  '{"on_submit": "task.created"}'::jsonb
FROM companies c
ON CONFLICT (tenant_id, command_key) DO NOTHING;

-- /zeit - Zeiterfassung
INSERT INTO chat_commands (tenant_id, command_key, command_triggers, label, description, roles_allowed, fields_schema, validation_rules, workflow_hooks)
SELECT 
  c.id,
  'timeentry.create',
  ARRAY['/zeit', '/time', '/timetrack'],
  '{"de": "Zeit erfassen", "en": "Log time"}'::jsonb,
  '{"de": "Arbeitszeit für Projekt oder Aufgabe erfassen", "en": "Log work time for project or task"}'::jsonb,
  ARRAY['employee', 'manager'],
  '{
    "fields": [
      {"id": "project", "type": "entity", "entity_type": "project", "label": {"de": "Projekt", "en": "Project"}},
      {"id": "start_time", "type": "datetime", "label": {"de": "Start", "en": "Start"}, "required": true},
      {"id": "end_time", "type": "datetime", "label": {"de": "Ende", "en": "End"}, "required": true},
      {"id": "description", "type": "textarea", "label": {"de": "Tätigkeit", "en": "Activity"}}
    ]
  }'::jsonb,
  '{"maxHoursPerDay": 12}'::jsonb,
  '{"on_submit": "timeentry.created"}'::jsonb
FROM companies c
ON CONFLICT (tenant_id, command_key) DO NOTHING;

-- /meeting - Termin erstellen
INSERT INTO chat_commands (tenant_id, command_key, command_triggers, label, description, roles_allowed, fields_schema, validation_rules, workflow_hooks)
SELECT 
  c.id,
  'meeting.create',
  ARRAY['/meeting', '/termin'],
  '{"de": "Termin erstellen", "en": "Create meeting"}'::jsonb,
  '{"de": "Besprechungstermin mit Teilnehmern erstellen", "en": "Create meeting with participants"}'::jsonb,
  ARRAY['employee', 'manager', 'hr'],
  '{
    "fields": [
      {"id": "title", "type": "text", "label": {"de": "Titel", "en": "Title"}, "required": true},
      {"id": "date", "type": "date", "label": {"de": "Datum", "en": "Date"}, "required": true},
      {"id": "time", "type": "time", "label": {"de": "Uhrzeit", "en": "Time"}, "required": true},
      {"id": "duration", "type": "number", "label": {"de": "Dauer (Minuten)", "en": "Duration (minutes)"}, "default": 60},
      {"id": "participants", "type": "users", "label": {"de": "Teilnehmer", "en": "Participants"}, "multiple": true},
      {"id": "location", "type": "text", "label": {"de": "Ort", "en": "Location"}},
      {"id": "description", "type": "textarea", "label": {"de": "Beschreibung", "en": "Description"}}
    ]
  }'::jsonb,
  '{}'::jsonb,
  '{"on_submit": "calendar.event.created"}'::jsonb
FROM companies c
ON CONFLICT (tenant_id, command_key) DO NOTHING;

-- /ticket - HR Helpdesk Ticket
INSERT INTO chat_commands (tenant_id, command_key, command_triggers, label, description, roles_allowed, fields_schema, validation_rules, workflow_hooks)
SELECT 
  c.id,
  'ticket.create',
  ARRAY['/ticket', '/helpdesk', '/support'],
  '{"de": "HR Ticket erstellen", "en": "Create HR ticket"}'::jsonb,
  '{"de": "Support-Ticket für HR Helpdesk erstellen", "en": "Create support ticket for HR helpdesk"}'::jsonb,
  ARRAY['employee', 'manager', 'hr'],
  '{
    "fields": [
      {"id": "category", "type": "select", "label": {"de": "Kategorie", "en": "Category"}, "options": [
        {"value": "payroll", "label": {"de": "Lohn & Gehalt", "en": "Payroll"}},
        {"value": "absence", "label": {"de": "Abwesenheit", "en": "Absence"}},
        {"value": "contract", "label": {"de": "Vertrag", "en": "Contract"}},
        {"value": "it", "label": {"de": "IT-Support", "en": "IT Support"}},
        {"value": "other", "label": {"de": "Sonstiges", "en": "Other"}}
      ], "required": true},
      {"id": "priority", "type": "select", "label": {"de": "Priorität", "en": "Priority"}, "options": [
        {"value": "low", "label": {"de": "Niedrig", "en": "Low"}},
        {"value": "medium", "label": {"de": "Mittel", "en": "Medium"}},
        {"value": "high", "label": {"de": "Hoch", "en": "High"}},
        {"value": "urgent", "label": {"de": "Dringend", "en": "Urgent"}}
      ], "default": "medium"},
      {"id": "description", "type": "textarea", "label": {"de": "Beschreibung", "en": "Description"}, "required": true},
      {"id": "attachments", "type": "files", "label": {"de": "Anhänge", "en": "Attachments"}, "accept": ["*/*"], "multiple": true}
    ]
  }'::jsonb,
  '{}'::jsonb,
  '{"on_submit": "ticket.created"}'::jsonb
FROM companies c
ON CONFLICT (tenant_id, command_key) DO NOTHING;

-- /genehmigung - Genehmigungen anzeigen
INSERT INTO chat_commands (tenant_id, command_key, command_triggers, label, description, roles_allowed, fields_schema, validation_rules, workflow_hooks)
SELECT 
  c.id,
  'approval.list',
  ARRAY['/genehmigung', '/approve', '/approval'],
  '{"de": "Genehmigungen anzeigen", "en": "Show approvals"}'::jsonb,
  '{"de": "Liste offener Genehmigungen mit Aktionen", "en": "List pending approvals with actions"}'::jsonb,
  ARRAY['manager', 'hr', 'admin'],
  '{
    "type": "list",
    "actions": [
      {"id": "approve", "label": {"de": "Genehmigen", "en": "Approve"}, "variant": "primary", "bulk": true},
      {"id": "reject", "label": {"de": "Ablehnen", "en": "Reject"}, "variant": "destructive", "bulk": true}
    ]
  }'::jsonb,
  '{}'::jsonb,
  '{"on_action": "approval.decision"}'::jsonb
FROM companies c
ON CONFLICT (tenant_id, command_key) DO NOTHING;