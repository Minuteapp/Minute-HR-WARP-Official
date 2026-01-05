-- DATENREPARATUR: Bestehende Daten Firmen zuordnen
-- Problem: Alle bestehenden Daten haben company_id = NULL

-- Schritt 1: Erstelle eine Standard-Firma falls keine existiert für historische Daten
INSERT INTO companies (
  id, name, address, billing_email, phone, website, 
  subscription_status, is_active, employee_count
) VALUES (
  'default-company-legacy',
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
SET company_id = 'default-company-legacy'
WHERE company_id IS NULL;

-- Schritt 3: Weise alle Tasks ohne company_id der Legacy-Firma zu  
UPDATE tasks 
SET company_id = 'default-company-legacy'
WHERE company_id IS NULL;

-- Schritt 4: Weise alle Projekte ohne company_id der Legacy-Firma zu
UPDATE projects 
SET company_id = 'default-company-legacy'
WHERE company_id IS NULL;

-- Schritt 5: Aktualisiere user_roles - setze Superadmin zur Legacy-Firma
-- (Superadmin sollte aber eigentlich keine company_id haben für globalen Zugriff)
-- UPDATE user_roles 
-- SET company_id = 'default-company-legacy'
-- WHERE company_id IS NULL AND role != 'superadmin';

-- Schritt 6: Prüfe welche anderen Tabellen company_id haben
SELECT table_name, column_name 
FROM information_schema.columns 
WHERE column_name = 'company_id' 
AND table_schema = 'public';