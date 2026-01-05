-- HARDCORE DATEN-BEREINIGUNG - Alle duplizierten Daten löschen

-- 1. SOFORT: Alle Daten in neuen Firmen löschen (behalte nur SVH GmbH)
DELETE FROM employees WHERE company_id IN ('5c45f573-d36e-4317-bf28-544215ab0cac', '94279a86-fe54-4331-b331-03116c82bbe6', 'a581a8b5-3b4d-4ed9-a565-103cd5cdbd44', 'fe235933-3e90-4ce5-a363-a20ea05e8c2f', '9b5ef107-188f-4d66-92b9-19409bf58439');

DELETE FROM tasks WHERE company_id IN ('5c45f573-d36e-4317-bf28-544215ab0cac', '94279a86-fe54-4331-b331-03116c82bbe6', 'a581a8b5-3b4d-4ed9-a565-103cd5cdbd44', 'fe235933-3e90-4ce5-a363-a20ea05e8c2f', '9b5ef107-188f-4d66-92b9-19409bf58439');

DELETE FROM projects WHERE company_id IN ('5c45f573-d36e-4317-bf28-544215ab0cac', '94279a86-fe54-4331-b331-03116c82bbe6', 'a581a8b5-3b4d-4ed9-a565-103cd5cdbd44', 'fe235933-3e90-4ce5-a363-a20ea05e8c2f', '9b5ef107-188f-4d66-92b9-19409bf58439');

DELETE FROM goals WHERE company_id IN ('5c45f573-d36e-4317-bf28-544215ab0cac', '94279a86-fe54-4331-b331-03116c82bbe6', 'a581a8b5-3b4d-4ed9-a565-103cd5cdbd44', 'fe235933-3e90-4ce5-a363-a20ea05e8c2f', '9b5ef107-188f-4d66-92b9-19409bf58439');

DELETE FROM calendar_events WHERE company_id IN ('5c45f573-d36e-4317-bf28-544215ab0cac', '94279a86-fe54-4331-b331-03116c82bbe6', 'a581a8b5-3b4d-4ed9-a565-103cd5cdbd44', 'fe235933-3e90-4ce5-a363-a20ea05e8c2f', '9b5ef107-188f-4d66-92b9-19409bf58439');

-- 2. Tenant-Session komplett entfernen
DELETE FROM user_tenant_sessions WHERE user_id = 'e7219c39-dbe0-45f3-a6b8-cbbf20517bb2';

-- 3. Alle Daten ohne company_id zur ursprünglichen Firma zuweisen
UPDATE employees SET company_id = '3650d0c8-99b3-4af5-9f8a-62dec75d1ae1' WHERE company_id IS NULL;
UPDATE tasks SET company_id = '3650d0c8-99b3-4af5-9f8a-62dec75d1ae1' WHERE company_id IS NULL;
UPDATE projects SET company_id = '3650d0c8-99b3-4af5-9f8a-62dec75d1ae1' WHERE company_id IS NULL;
UPDATE goals SET company_id = '3650d0c8-99b3-4af5-9f8a-62dec75d1ae1' WHERE company_id IS NULL;