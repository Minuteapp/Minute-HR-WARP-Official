-- =====================================================
-- 80/20 Default-Berechtigungen für Employee-Rolle KORRIGIEREN
-- Diese Updates waren in der vorherigen Migration nicht angewendet worden
-- =====================================================

-- Projekte: Eigene + Team-Projekte sehen
UPDATE role_permission_matrix
SET is_visible = true, allowed_actions = ARRAY['view']
WHERE role = 'employee' AND module_name = 'projects';

-- Geschäftsreisen: Eigene erstellen und verwalten
UPDATE role_permission_matrix
SET is_visible = true, allowed_actions = ARRAY['view', 'create', 'edit']
WHERE role = 'employee' AND module_name = 'business_travel';

-- Ausgaben: Eigene erstellen und verwalten
UPDATE role_permission_matrix
SET is_visible = true, allowed_actions = ARRAY['view', 'create', 'edit']
WHERE role = 'employee' AND module_name = 'expenses';

-- Performance: Nur eigene Performance sehen
UPDATE role_permission_matrix
SET is_visible = true, allowed_actions = ARRAY['view']
WHERE role = 'employee' AND module_name = 'performance';

-- Mitarbeiterumfragen: Teilnehmen
UPDATE role_permission_matrix
SET is_visible = true, allowed_actions = ARRAY['view', 'create']
WHERE role = 'employee' AND module_name = 'pulse_surveys';

-- Benefits/Rewards: Eigene Benefits sehen
UPDATE role_permission_matrix
SET is_visible = true, allowed_actions = ARRAY['view']
WHERE role = 'employee' AND module_name = 'rewards';

-- Innovation Hub: Ideen einreichen
UPDATE role_permission_matrix
SET is_visible = true, allowed_actions = ARRAY['view', 'create']
WHERE role = 'employee' AND module_name = 'innovation';

-- Schichtplanung: Eigene Schichten sehen
UPDATE role_permission_matrix
SET is_visible = true, allowed_actions = ARRAY['view']
WHERE role = 'employee' AND module_name = 'shift_planning';

-- Onboarding: Eigenes Onboarding sehen
UPDATE role_permission_matrix
SET is_visible = true, allowed_actions = ARRAY['view']
WHERE role = 'employee' AND module_name = 'onboarding';

-- Nachhaltigkeit/Environment: Lesen
UPDATE role_permission_matrix
SET is_visible = true, allowed_actions = ARRAY['view']
WHERE role = 'employee' AND module_name = 'environment';

-- Lohn & Gehalt: NUR eigene Abrechnungen sehen
UPDATE role_permission_matrix
SET is_visible = true, allowed_actions = ARRAY['view']
WHERE role = 'employee' AND module_name = 'payroll';

-- Global Mobility: Eigene Anträge sehen/erstellen
UPDATE role_permission_matrix
SET is_visible = true, allowed_actions = ARRAY['view', 'create']
WHERE role = 'employee' AND module_name = 'global_mobility';