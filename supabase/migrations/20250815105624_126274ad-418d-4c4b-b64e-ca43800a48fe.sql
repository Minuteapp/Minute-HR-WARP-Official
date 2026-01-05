-- Füge workflow_type Spalte hinzu (falls nicht vorhanden)
ALTER TABLE workflow_templates 
ADD COLUMN IF NOT EXISTS workflow_type text DEFAULT 'approval';

-- Jetzt die Standard-Templates erstellen mit workflow_type
INSERT INTO workflow_templates (template_key, name, description, workflow_type, approval_steps, is_active, created_by)
VALUES 
  ('vacation_approval', 'Urlaubsantrag Genehmigung', 'Standard Genehmigungsprozess für Urlaubsanträge', 'approval',
   '[{"type": "approval", "approver_role": "manager", "conditions": {}}]'::jsonb, true, 
   (SELECT id FROM auth.users LIMIT 1)),
  ('sick_leave_approval', 'Krankmeldung Genehmigung', 'Genehmigungsprozess für Krankmeldungen', 'approval',
   '[{"type": "approval", "approver_role": "hr", "conditions": {}}]'::jsonb, true, 
   (SELECT id FROM auth.users LIMIT 1)),
  ('overtime_approval', 'Überstunden Genehmigung', 'Genehmigungsprozess für Überstunden', 'approval',
   '[{"type": "approval", "approver_role": "manager", "conditions": {}}]'::jsonb, true, 
   (SELECT id FROM auth.users LIMIT 1)),
  ('expense_approval', 'Kostenerstattung', 'Genehmigungsprozess für Kostenerstattungen', 'approval',
   '[{"type": "approval", "approver_role": "manager", "conditions": {"max_amount": 500}}, {"type": "approval", "approver_role": "admin", "conditions": {"min_amount": 500}}]'::jsonb, true, 
   (SELECT id FROM auth.users LIMIT 1)),
  ('general_approval', 'Allgemeine Genehmigung', 'Standard Genehmigungsprozess für alle anderen Anträge', 'approval',
   '[{"type": "approval", "approver_role": "admin", "conditions": {}}]'::jsonb, true, 
   (SELECT id FROM auth.users LIMIT 1))
ON CONFLICT (template_key) DO NOTHING;