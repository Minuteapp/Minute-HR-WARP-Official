-- Fix: Entferne den redundanten Composite-Constraint
-- Der single-column Constraint (session_user_id) ist ausreichend,
-- da ein User nur in einem Tenant gleichzeitig aktiv sein kann.

-- 1. Entferne den redundanten Composite-Constraint
ALTER TABLE public.active_tenant_sessions 
DROP CONSTRAINT IF EXISTS active_tenant_sessions_session_user_id_impersonated_company_key;

-- 2. Stelle sicher, dass nur der single-key Constraint existiert
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'active_tenant_sessions_session_user_id_key'
    AND conrelid = 'public.active_tenant_sessions'::regclass
  ) THEN
    ALTER TABLE public.active_tenant_sessions 
    ADD CONSTRAINT active_tenant_sessions_session_user_id_key 
    UNIQUE (session_user_id);
  END IF;
END $$;

-- 3. Bereinige alte/doppelte Einträge (behalte nur den neuesten pro User)
DELETE FROM public.active_tenant_sessions a
WHERE a.id NOT IN (
  SELECT DISTINCT ON (session_user_id) id
  FROM public.active_tenant_sessions
  ORDER BY session_user_id, created_at DESC
);