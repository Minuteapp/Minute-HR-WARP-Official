-- Füge user_id Spalte zur employees-Tabelle hinzu
ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Index für bessere Performance
CREATE INDEX IF NOT EXISTS idx_employees_user_id ON employees(user_id);

-- Versuche bestehende Verknüpfungen über E-Mail herzustellen
UPDATE employees e
SET user_id = au.id
FROM auth.users au
WHERE e.email = au.email
  AND e.user_id IS NULL
  AND e.email IS NOT NULL;