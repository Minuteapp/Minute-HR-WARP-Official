-- Repariere nur die TASKS Tabelle zuerst
DROP POLICY IF EXISTS "Task isolation by company" ON tasks;
DROP POLICY IF EXISTS "Users can view their own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can create tasks" ON tasks;
DROP POLICY IF EXISTS "Users can update their own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can delete their own tasks" ON tasks;
DROP POLICY IF EXISTS "SuperAdmins can manage all tasks" ON tasks;
DROP POLICY IF EXISTS "Task Company Isolation" ON tasks;

CREATE POLICY "Task Company Isolation CRITICAL" 
ON tasks FOR ALL 
USING (
  CASE
    -- Im Tenant-Modus: Nur Daten der aktuellen Tenant-Firma anzeigen
    WHEN is_in_tenant_context() THEN 
      company_id = get_tenant_company_id_safe()
    -- SuperAdmin ohne Tenant-Modus: Alle Daten sehen
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN 
      true
    -- Normale Benutzer: Nur ihre eigenen Firmendaten
    ELSE 
      company_id = get_user_company_id(auth.uid()) OR company_id IS NULL
  END
)
WITH CHECK (
  CASE
    -- Im Tenant-Modus: Nur in der aktuellen Tenant-Firma erstellen/bearbeiten
    WHEN is_in_tenant_context() THEN 
      company_id = get_tenant_company_id_safe()
    -- SuperAdmin ohne Tenant-Modus: Alles bearbeiten
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN 
      true
    -- Normale Benutzer: Nur in ihrer eigenen Firma erstellen/bearbeiten
    ELSE 
      company_id = get_user_company_id(auth.uid()) OR company_id IS NULL
  END
);