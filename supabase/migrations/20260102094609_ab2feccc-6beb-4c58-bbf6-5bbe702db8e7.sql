-- Fix: Füge 'paused' zum status check hinzu (falls der Fehler wegen status kommt)
ALTER TABLE public.time_entries DROP CONSTRAINT IF EXISTS time_entries_status_check;
ALTER TABLE public.time_entries DROP CONSTRAINT IF EXISTS valid_status;
ALTER TABLE public.time_entries 
ADD CONSTRAINT time_entries_status_check 
CHECK (status = ANY (ARRAY['active'::text, 'pending'::text, 'completed'::text, 'cancelled'::text, 'paused'::text]));

-- Fix: Erstelle Unique-Constraint für active_tenant_sessions falls noch nicht vorhanden
-- (für ON CONFLICT zu funktionieren)
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