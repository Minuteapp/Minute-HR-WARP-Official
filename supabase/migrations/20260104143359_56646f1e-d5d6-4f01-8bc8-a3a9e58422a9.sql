-- UNIQUE-Constraint für active_tenant_sessions.session_user_id hinzufügen
-- Dies ermöglicht ON CONFLICT in start_impersonation_session

-- Erst eventuell vorhandene Duplikate bereinigen (nur den neuesten behalten)
DELETE FROM public.active_tenant_sessions a
WHERE EXISTS (
  SELECT 1 FROM public.active_tenant_sessions b
  WHERE b.session_user_id = a.session_user_id
  AND b.created_at > a.created_at
);

-- Jetzt UNIQUE-Constraint hinzufügen
ALTER TABLE public.active_tenant_sessions 
ADD CONSTRAINT active_tenant_sessions_session_user_id_key UNIQUE (session_user_id);