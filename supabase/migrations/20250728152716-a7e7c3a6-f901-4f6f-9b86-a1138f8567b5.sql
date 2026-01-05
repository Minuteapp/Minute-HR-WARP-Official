-- DATENREPARATUR: Bestehende Daten Firmen zuordnen (korrekte UUID)
-- Problem: Alle bestehenden Daten haben company_id = NULL

-- Schritt 1: Erstelle eine Standard-Firma falls keine existiert für historische Daten  
INSERT INTO companies (
  id, name, address, billing_email, phone, website, 
  subscription_status, is_active, employee_count
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Legacy System Data',
  'System Generated',
  'system@example.com',
  '',
  '',
  'free',
  true,
  0
) ON CONFLICT (id) DO NOTHING;

-- Schritt 2: Weise alle Mitarbeiter ohne company_id der Legacy-Firma zu
UPDATE employees 
SET company_id = '00000000-0000-0000-0000-000000000001'
WHERE company_id IS NULL;

-- Schritt 3: Weise alle Tasks ohne company_id der Legacy-Firma zu  
UPDATE tasks 
SET company_id = '00000000-0000-0000-0000-000000000001'
WHERE company_id IS NULL;

-- Schritt 4: Weise alle Projekte ohne company_id der Legacy-Firma zu
UPDATE projects 
SET company_id = '00000000-0000-0000-0000-000000000001'
WHERE company_id IS NULL;

-- Schritt 5: Zeige Anzahl der aktualisierten Datensätze
SELECT 
  (SELECT COUNT(*) FROM employees WHERE company_id = '00000000-0000-0000-0000-000000000001') as employees_updated,
  (SELECT COUNT(*) FROM tasks WHERE company_id = '00000000-0000-0000-0000-000000000001') as tasks_updated,
  (SELECT COUNT(*) FROM projects WHERE company_id = '00000000-0000-0000-0000-000000000001') as projects_updated;