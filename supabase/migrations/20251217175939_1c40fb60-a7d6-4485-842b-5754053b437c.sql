-- Fix substitute_id FK: Referenziert employees statt auth.users
ALTER TABLE absence_requests 
DROP CONSTRAINT IF EXISTS absence_requests_substitute_id_fkey;

ALTER TABLE absence_requests
ADD CONSTRAINT absence_requests_substitute_id_fkey 
FOREIGN KEY (substitute_id) REFERENCES employees(id) ON DELETE SET NULL;

-- Kommentar hinzufügen
COMMENT ON COLUMN absence_requests.substitute_id IS 'Referenziert employees(id), nicht auth.users';