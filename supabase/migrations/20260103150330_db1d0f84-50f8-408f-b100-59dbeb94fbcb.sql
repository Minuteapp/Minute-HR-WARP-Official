-- =====================================================
-- ROLLEN-BEREINIGUNG: Schritt 1 - DE Duplikate löschen
-- =====================================================

-- 1. Lösche DE-Namen wo EN-Namen bereits existieren
DELETE FROM role_permission_matrix 
WHERE module_name = 'Abwesenheit' 
  AND EXISTS (SELECT 1 FROM role_permission_matrix rpm2 WHERE rpm2.role = role_permission_matrix.role AND rpm2.module_name = 'absence');

DELETE FROM role_permission_matrix 
WHERE module_name = 'Aufgaben' 
  AND EXISTS (SELECT 1 FROM role_permission_matrix rpm2 WHERE rpm2.role = role_permission_matrix.role AND rpm2.module_name = 'tasks');

DELETE FROM role_permission_matrix 
WHERE module_name = 'Dokumente' 
  AND EXISTS (SELECT 1 FROM role_permission_matrix rpm2 WHERE rpm2.role = role_permission_matrix.role AND rpm2.module_name = 'documents');

DELETE FROM role_permission_matrix 
WHERE module_name = 'Zeiterfassung' 
  AND EXISTS (SELECT 1 FROM role_permission_matrix rpm2 WHERE rpm2.role = role_permission_matrix.role AND rpm2.module_name = 'time_tracking');

DELETE FROM role_permission_matrix 
WHERE module_name = 'Mitarbeiter' 
  AND EXISTS (SELECT 1 FROM role_permission_matrix rpm2 WHERE rpm2.role = role_permission_matrix.role AND rpm2.module_name = 'employees');

DELETE FROM role_permission_matrix 
WHERE module_name = 'Berichte' 
  AND EXISTS (SELECT 1 FROM role_permission_matrix rpm2 WHERE rpm2.role = role_permission_matrix.role AND rpm2.module_name = 'reports');

DELETE FROM role_permission_matrix 
WHERE module_name = 'Einstellungen' 
  AND EXISTS (SELECT 1 FROM role_permission_matrix rpm2 WHERE rpm2.role = role_permission_matrix.role AND rpm2.module_name = 'settings');

DELETE FROM role_permission_matrix 
WHERE module_name = 'Kalender' 
  AND EXISTS (SELECT 1 FROM role_permission_matrix rpm2 WHERE rpm2.role = role_permission_matrix.role AND rpm2.module_name = 'calendar');

-- 2. Jetzt die verbleibenden DE-Namen umwandeln
UPDATE role_permission_matrix SET module_name = 'absence' WHERE module_name = 'Abwesenheit';
UPDATE role_permission_matrix SET module_name = 'tasks' WHERE module_name = 'Aufgaben';
UPDATE role_permission_matrix SET module_name = 'documents' WHERE module_name = 'Dokumente';
UPDATE role_permission_matrix SET module_name = 'time_tracking' WHERE module_name = 'Zeiterfassung';
UPDATE role_permission_matrix SET module_name = 'employees' WHERE module_name = 'Mitarbeiter';
UPDATE role_permission_matrix SET module_name = 'reports' WHERE module_name = 'Berichte';
UPDATE role_permission_matrix SET module_name = 'settings' WHERE module_name = 'Einstellungen';
UPDATE role_permission_matrix SET module_name = 'calendar' WHERE module_name = 'Kalender';

-- 3. Lösche alle Rollen außer den 4 gewünschten
DELETE FROM role_permission_matrix 
WHERE role NOT IN ('admin', 'hr_admin', 'team_lead', 'employee');

-- 4. Aktualisiere user_roles
UPDATE user_roles SET role = 'admin' WHERE role = 'superadmin';
UPDATE user_roles SET role = 'team_lead' WHERE role = 'manager';
UPDATE user_roles SET role = 'hr_admin' WHERE role = 'hr_manager';
UPDATE user_roles SET role = 'hr_admin' WHERE role = 'hr';
UPDATE user_roles SET role = 'employee' WHERE role NOT IN ('admin', 'hr_admin', 'team_lead', 'employee');

-- 5. user_role_preview_sessions bereinigen
UPDATE user_role_preview_sessions SET preview_role = 'admin' WHERE preview_role = 'superadmin';
UPDATE user_role_preview_sessions SET preview_role = 'team_lead' WHERE preview_role = 'manager';
UPDATE user_role_preview_sessions SET preview_role = 'hr_admin' WHERE preview_role IN ('hr', 'hr_manager');
UPDATE user_role_preview_sessions SET original_role = 'admin' WHERE original_role = 'superadmin';
UPDATE user_role_preview_sessions SET original_role = 'team_lead' WHERE original_role = 'manager';
UPDATE user_role_preview_sessions SET original_role = 'hr_admin' WHERE original_role IN ('hr', 'hr_manager');