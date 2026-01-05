-- Add UNIQUE constraint on employees.user_id for proper UPSERT behavior
-- First check if constraint already exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'employees_user_id_key'
  ) THEN
    ALTER TABLE employees 
    ADD CONSTRAINT employees_user_id_key UNIQUE (user_id);
  END IF;
END $$;