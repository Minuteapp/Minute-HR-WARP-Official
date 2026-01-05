-- Insert comprehensive test data for certificates
INSERT INTO employee_certificates (
  employee_id, 
  name, 
  provider, 
  issued_date, 
  expiry_date, 
  category,
  certificate_number,
  score
) VALUES 
-- 1. Führerschein Klasse B (Gültig, Lizenz)
('dddddddd-3333-4444-5555-cccccccccccc', 'Führerschein Klasse B', 'Stadt Berlin', '2008-08-18', '2026-08-18', 'license', NULL, NULL),

-- 2. TOEFL English Certificate (Abgelaufen, Fachlich)
('dddddddd-3333-4444-5555-cccccccccccc', 'TOEFL English Certificate', 'ETS', '2020-02-12', '2022-03-12', 'professional', NULL, '110/120'),

-- 3. Datenschutz-Schulung DSGVO (Gültig, Compliance)
('dddddddd-3333-4444-5555-cccccccccccc', 'Datenschutz-Schulung (DSGVO)', 'Interne Schulung', '2022-10-14', '2026-10-14', 'compliance', NULL, NULL),

-- 4. Arbeitssicherheit Grundlagen (Gültig, Compliance)
('dddddddd-3333-4444-5555-cccccccccccc', 'Arbeitssicherheit Grundlagen', 'TÜV Nord', '2023-09-15', '2027-10-15', 'compliance', NULL, NULL),

-- 5. AWS Certified Solutions Architect (Gültig, Fachlich)
('dddddddd-3333-4444-5555-cccccccccccc', 'AWS Certified Solutions Architect', 'Amazon Web Services', '2022-09-12', '2027-10-20', 'professional', 'AWS-CSA-2024-12345', NULL),

-- 6. Scrum Master Certified (Gültig, Fachlich - unbegrenzt)
('dddddddd-3333-4444-5555-cccccccccccc', 'Scrum Master Certified (SMC)', 'Scrum Alliance', '2023-10-09', NULL, 'professional', NULL, NULL),

-- 7. Ersthelfer-Ausbildung (Läuft bald ab, Sicherheit)
('dddddddd-3333-4444-5555-cccccccccccc', 'Ersthelfer-Ausbildung', 'DRK', '2024-03-05', '2025-06-05', 'safety', NULL, NULL);