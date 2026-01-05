-- Prüfe die aktuellen Check-Constraints für budget_templates
SELECT conname, contype, pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'budget_templates'::regclass 
AND contype = 'c';

-- Entferne den bestehenden Check-Constraint falls vorhanden
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conrelid = 'budget_templates'::regclass 
        AND conname = 'budget_templates_template_type_check'
    ) THEN
        ALTER TABLE budget_templates DROP CONSTRAINT budget_templates_template_type_check;
    END IF;
END $$;

-- Erstelle einen neuen Check-Constraint mit den korrekten Werten
ALTER TABLE budget_templates 
ADD CONSTRAINT budget_templates_template_type_check 
CHECK (template_type IN (
    'budget', 'personnel', 'project', 'growth', 'crisis', 'custom',
    'forecast', 'budget_plan', 'expense_report', 'payroll'
));