-- SuperAdmins können ihre eigenen Tenant-Sessions lesen (für das Laden des Tenant-Kontexts)
CREATE POLICY "superadmin_read_own_tenant_session"
ON public.user_tenant_sessions
FOR SELECT
USING (
  user_id = auth.uid()
);

-- SuperAdmins können ihre eigenen Tenant-Sessions aktualisieren
CREATE POLICY "superadmin_update_own_tenant_session"
ON public.user_tenant_sessions
FOR UPDATE
USING (
  user_id = auth.uid()
);

-- SuperAdmins können ihre eigenen Tenant-Sessions einfügen
CREATE POLICY "superadmin_insert_own_tenant_session"
ON public.user_tenant_sessions
FOR INSERT
WITH CHECK (
  user_id = auth.uid()
);