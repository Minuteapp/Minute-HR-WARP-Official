-- =====================================================
-- ACTION REGISTRY EINTRÄGE FÜR NEUE EVENTS
-- =====================================================

-- Roadmap Actions
INSERT INTO action_registry (action_name, module, entity_type, description, description_de, is_active)
VALUES
  ('roadmap.created', 'roadmaps', 'roadmap', 'A roadmap was created', 'Eine Roadmap wurde erstellt', true),
  ('roadmap.updated', 'roadmaps', 'roadmap', 'A roadmap was updated', 'Eine Roadmap wurde aktualisiert', true),
  ('roadmap.deleted', 'roadmaps', 'roadmap', 'A roadmap was deleted', 'Eine Roadmap wurde gelöscht', true)
ON CONFLICT (action_name) DO NOTHING;

-- Department Actions
INSERT INTO action_registry (action_name, module, entity_type, description, description_de, is_active)
VALUES
  ('department.created', 'organization', 'department', 'A department was created', 'Eine Abteilung wurde erstellt', true),
  ('department.updated', 'organization', 'department', 'A department was updated', 'Eine Abteilung wurde aktualisiert', true),
  ('department.deleted', 'organization', 'department', 'A department was deleted', 'Eine Abteilung wurde gelöscht', true)
ON CONFLICT (action_name) DO NOTHING;

-- Settings Actions
INSERT INTO action_registry (action_name, module, entity_type, description, description_de, is_active)
VALUES
  ('settings.language_changed', 'settings', 'global_settings', 'Language settings changed', 'Spracheinstellungen wurden geändert', true),
  ('settings.updated', 'settings', 'global_settings', 'Settings were updated', 'Einstellungen wurden aktualisiert', true)
ON CONFLICT (action_name) DO NOTHING;

-- Employee Actions
INSERT INTO action_registry (action_name, module, entity_type, description, description_de, is_active)
VALUES
  ('employee.created', 'employees', 'employee', 'An employee was created', 'Ein Mitarbeiter wurde erstellt', true),
  ('employee.updated', 'employees', 'employee', 'An employee was updated', 'Ein Mitarbeiter wurde aktualisiert', true),
  ('employee.deleted', 'employees', 'employee', 'An employee was deleted', 'Ein Mitarbeiter wurde gelöscht', true)
ON CONFLICT (action_name) DO NOTHING;

-- Task Actions
INSERT INTO action_registry (action_name, module, entity_type, description, description_de, is_active)
VALUES
  ('task.created', 'tasks', 'task', 'A task was created', 'Eine Aufgabe wurde erstellt', true),
  ('task.updated', 'tasks', 'task', 'A task was updated', 'Eine Aufgabe wurde aktualisiert', true),
  ('task.assigned', 'tasks', 'task', 'A task was assigned', 'Eine Aufgabe wurde zugewiesen', true),
  ('task.completed', 'tasks', 'task', 'A task was completed', 'Eine Aufgabe wurde abgeschlossen', true),
  ('task.deleted', 'tasks', 'task', 'A task was deleted', 'Eine Aufgabe wurde gelöscht', true)
ON CONFLICT (action_name) DO NOTHING;

-- Project Actions
INSERT INTO action_registry (action_name, module, entity_type, description, description_de, is_active)
VALUES
  ('project.created', 'projects', 'project', 'A project was created', 'Ein Projekt wurde erstellt', true),
  ('project.updated', 'projects', 'project', 'A project was updated', 'Ein Projekt wurde aktualisiert', true),
  ('project.deleted', 'projects', 'project', 'A project was deleted', 'Ein Projekt wurde gelöscht', true)
ON CONFLICT (action_name) DO NOTHING;