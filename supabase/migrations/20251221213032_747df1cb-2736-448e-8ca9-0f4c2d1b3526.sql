-- Standard-Berechtigungen für alle Rollen einfügen
-- Dashboard & Übersicht
INSERT INTO public.travel_role_permissions (role_key, category, category_icon, feature_key, feature_label, granted, sort_order)
SELECT role_key, 'dashboard', 'layout-dashboard', feature_key, feature_label, 
  CASE 
    WHEN role_key = 'admin' THEN true
    WHEN role_key = 'hr_admin' AND feature_key IN ('own_dashboard', 'total_budget', 'team_budget', 'own_budget') THEN true
    WHEN role_key = 'team_lead' AND feature_key IN ('own_dashboard', 'team_budget', 'own_budget') THEN true
    WHEN role_key = 'employee' AND feature_key IN ('own_dashboard', 'own_budget') THEN true
    ELSE false
  END as granted,
  feature_order
FROM public.travel_role_definitions
CROSS JOIN (
  VALUES 
    ('own_dashboard', 'Eigenes Dashboard anzeigen', 1),
    ('total_budget', 'Gesamtbudget einsehen', 2),
    ('team_budget', 'Team-Budget einsehen', 3),
    ('own_budget', 'Eigenes Budget einsehen', 4),
    ('system_activity', 'Systemaktivität verfolgen', 5)
) AS features(feature_key, feature_label, feature_order)
ON CONFLICT (role_key, category, feature_key) DO NOTHING;

-- Reiseanträge
INSERT INTO public.travel_role_permissions (role_key, category, category_icon, feature_key, feature_label, granted, sort_order)
SELECT role_key, 'travel_requests', 'plane', feature_key, feature_label,
  CASE 
    WHEN role_key = 'admin' THEN true
    WHEN role_key = 'hr_admin' AND feature_key IN ('create_own', 'view_all', 'view_team', 'view_own', 'approve_all', 'reject') THEN true
    WHEN role_key = 'team_lead' AND feature_key IN ('create_own', 'view_team', 'view_own', 'approve_team', 'reject') THEN true
    WHEN role_key = 'employee' AND feature_key IN ('create_own', 'view_own') THEN true
    ELSE false
  END as granted,
  feature_order
FROM public.travel_role_definitions
CROSS JOIN (
  VALUES 
    ('create_own', 'Eigene Reiseanträge erstellen', 1),
    ('view_all', 'Alle Reiseanträge einsehen', 2),
    ('view_team', 'Team-Reiseanträge einsehen', 3),
    ('view_own', 'Eigene Reiseanträge einsehen', 4),
    ('approve_all', 'Alle Anträge genehmigen', 5),
    ('approve_team', 'Team-Anträge genehmigen', 6),
    ('reject', 'Anträge ablehnen', 7)
) AS features(feature_key, feature_label, feature_order)
ON CONFLICT (role_key, category, feature_key) DO NOTHING;

-- Spesenabrechnung
INSERT INTO public.travel_role_permissions (role_key, category, category_icon, feature_key, feature_label, granted, sort_order)
SELECT role_key, 'expenses', 'receipt', feature_key, feature_label,
  CASE 
    WHEN role_key = 'admin' THEN true
    WHEN role_key = 'hr_admin' AND feature_key IN ('submit_own', 'view_all', 'view_team', 'upload_receipts', 'use_ocr', 'approve') THEN true
    WHEN role_key = 'team_lead' AND feature_key IN ('submit_own', 'view_team', 'upload_receipts', 'use_ocr', 'approve') THEN true
    WHEN role_key = 'employee' AND feature_key IN ('submit_own', 'upload_receipts', 'use_ocr') THEN true
    ELSE false
  END as granted,
  feature_order
FROM public.travel_role_definitions
CROSS JOIN (
  VALUES 
    ('submit_own', 'Eigene Spesen einreichen', 1),
    ('view_all', 'Alle Spesen einsehen', 2),
    ('view_team', 'Team-Spesen einsehen', 3),
    ('upload_receipts', 'Belege hochladen', 4),
    ('use_ocr', 'OCR-Erkennung nutzen', 5),
    ('approve', 'Spesen genehmigen', 6)
) AS features(feature_key, feature_label, feature_order)
ON CONFLICT (role_key, category, feature_key) DO NOTHING;

-- Mitarbeiterverwaltung
INSERT INTO public.travel_role_permissions (role_key, category, category_icon, feature_key, feature_label, granted, sort_order)
SELECT role_key, 'employee_management', 'users', feature_key, feature_label,
  CASE 
    WHEN role_key = 'admin' THEN true
    WHEN role_key = 'hr_admin' AND feature_key IN ('view_all', 'view_team', 'manage', 'assign_budgets') THEN true
    WHEN role_key = 'team_lead' AND feature_key IN ('view_team', 'manage_team_budgets') THEN true
    ELSE false
  END as granted,
  feature_order
FROM public.travel_role_definitions
CROSS JOIN (
  VALUES 
    ('view_all', 'Alle Mitarbeiter einsehen', 1),
    ('view_team', 'Team-Mitarbeiter einsehen', 2),
    ('manage', 'Mitarbeiter verwalten', 3),
    ('assign_budgets', 'Mitarbeiter-Budgets zuweisen', 4),
    ('manage_team_budgets', 'Team-Budgets verwalten', 5)
) AS features(feature_key, feature_label, feature_order)
ON CONFLICT (role_key, category, feature_key) DO NOTHING;

-- Reporting & Analytics
INSERT INTO public.travel_role_permissions (role_key, category, category_icon, feature_key, feature_label, granted, sort_order)
SELECT role_key, 'reporting', 'bar-chart-3', feature_key, feature_label,
  CASE 
    WHEN role_key = 'admin' THEN true
    WHEN role_key = 'hr_admin' AND feature_key IN ('create_total', 'create_team', 'view_own', 'export_total', 'export_team', 'esg_tracking') THEN true
    WHEN role_key = 'team_lead' AND feature_key IN ('create_team', 'view_own', 'export_team', 'esg_tracking') THEN true
    WHEN role_key = 'employee' AND feature_key IN ('view_own') THEN true
    ELSE false
  END as granted,
  feature_order
FROM public.travel_role_definitions
CROSS JOIN (
  VALUES 
    ('create_total', 'Gesamt-Reports erstellen', 1),
    ('create_team', 'Team-Reports erstellen', 2),
    ('view_own', 'Eigene Reports einsehen', 3),
    ('export_total', 'Daten exportieren (gesamt)', 4),
    ('export_team', 'Team-Daten exportieren', 5),
    ('esg_tracking', 'ESG/CO₂-Tracking einsehen', 6)
) AS features(feature_key, feature_label, feature_order)
ON CONFLICT (role_key, category, feature_key) DO NOTHING;

-- Verwaltung & Einstellungen
INSERT INTO public.travel_role_permissions (role_key, category, category_icon, feature_key, feature_label, granted, sort_order)
SELECT role_key, 'administration', 'settings', feature_key, feature_label,
  CASE 
    WHEN role_key = 'admin' THEN true
    WHEN role_key = 'hr_admin' AND feature_key IN ('manage_categories', 'manage_policies') THEN true
    ELSE false
  END as granted,
  feature_order
FROM public.travel_role_definitions
CROSS JOIN (
  VALUES 
    ('manage_categories', 'Kategorien verwalten', 1),
    ('manage_policies', 'Richtlinien verwalten', 2),
    ('configure_workflows', 'Workflows konfigurieren', 3),
    ('manage_integrations', 'Integrationen verwalten', 4),
    ('system_settings', 'Systemeinstellungen', 5),
    ('manage_company_cards', 'Firmenkarten verwalten', 6)
) AS features(feature_key, feature_label, feature_order)
ON CONFLICT (role_key, category, feature_key) DO NOTHING;

-- Zusatzfunktionen
INSERT INTO public.travel_role_permissions (role_key, category, category_icon, feature_key, feature_label, granted, sort_order)
SELECT role_key, 'additional', 'sparkles', feature_key, feature_label,
  CASE 
    WHEN role_key = 'admin' THEN true
    WHEN role_key = 'hr_admin' AND feature_key IN ('live_map', 'per_diem', 'mileage', 'batch_approvals', 'forecast') THEN true
    WHEN role_key = 'team_lead' AND feature_key IN ('live_map', 'per_diem', 'mileage', 'batch_approvals') THEN true
    WHEN role_key = 'employee' AND feature_key IN ('per_diem', 'mileage') THEN true
    ELSE false
  END as granted,
  feature_order
FROM public.travel_role_definitions
CROSS JOIN (
  VALUES 
    ('live_map', 'Live Map Zugriff', 1),
    ('per_diem', 'Per-Diem Management', 2),
    ('mileage', 'Kilometer-Tracking', 3),
    ('batch_approvals', 'Batch-Genehmigungen', 4),
    ('forecast', 'Forecast-Dashboard', 5)
) AS features(feature_key, feature_label, feature_order)
ON CONFLICT (role_key, category, feature_key) DO NOTHING;