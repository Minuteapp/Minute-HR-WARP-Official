-- Füge template_key Spalte zu workflow_templates hinzu
ALTER TABLE workflow_templates 
ADD COLUMN IF NOT EXISTS template_key text UNIQUE;

-- Setze template_key für existierende Templates
UPDATE workflow_templates 
SET template_key = CASE 
  WHEN name ILIKE '%vacation%' OR name ILIKE '%urlaub%' THEN 'vacation_approval'
  WHEN name ILIKE '%sick%' OR name ILIKE '%krank%' THEN 'sick_leave_approval'
  WHEN name ILIKE '%overtime%' OR name ILIKE '%überstunden%' THEN 'overtime_approval'
  ELSE 'general_approval'
END
WHERE template_key IS NULL;

-- Jetzt die Standard-Templates erstellen
INSERT INTO workflow_templates (template_key, name, description, approval_steps, is_active, created_by)
VALUES 
  ('vacation_approval', 'Urlaubsantrag Genehmigung', 'Standard Genehmigungsprozess für Urlaubsanträge', 
   '[{"type": "approval", "approver_role": "manager", "conditions": {}}]'::jsonb, true, 
   (SELECT id FROM auth.users LIMIT 1)),
  ('sick_leave_approval', 'Krankmeldung Genehmigung', 'Genehmigungsprozess für Krankmeldungen', 
   '[{"type": "approval", "approver_role": "hr", "conditions": {}}]'::jsonb, true, 
   (SELECT id FROM auth.users LIMIT 1)),
  ('overtime_approval', 'Überstunden Genehmigung', 'Genehmigungsprozess für Überstunden', 
   '[{"type": "approval", "approver_role": "manager", "conditions": {}}]'::jsonb, true, 
   (SELECT id FROM auth.users LIMIT 1)),
  ('expense_approval', 'Kostenerstattung', 'Genehmigungsprozess für Kostenerstattungen', 
   '[{"type": "approval", "approver_role": "manager", "conditions": {"max_amount": 500}}, {"type": "approval", "approver_role": "admin", "conditions": {"min_amount": 500}}]'::jsonb, true, 
   (SELECT id FROM auth.users LIMIT 1)),
  ('general_approval', 'Allgemeine Genehmigung', 'Standard Genehmigungsprozess für alle anderen Anträge', 
   '[{"type": "approval", "approver_role": "admin", "conditions": {}}]'::jsonb, true, 
   (SELECT id FROM auth.users LIMIT 1))
ON CONFLICT (template_key) DO NOTHING;

-- Erstelle Standard Auto-Approval Regeln für kurze Urlaube
INSERT INTO auto_approval_conditions (workflow_template_id, condition_name, max_days, conditions)
SELECT id, 'Auto-Genehmigung für kurze Urlaube (≤2 Tage)', 2, '{"department_exceptions": ["management"]}'::jsonb
FROM workflow_templates 
WHERE template_key = 'vacation_approval'
ON CONFLICT DO NOTHING;