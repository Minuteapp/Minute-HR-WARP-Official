-- Fix: Superadmins ohne aktiven Tenant-/Impersonation-Kontext dürfen KEINE company_id per Fallback erhalten
-- Dadurch liefern company-basierte RLS-Policies für Superadmins ohne Kontext keine Datensätze.

CREATE OR REPLACE FUNCTION public.get_effective_company_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT
    CASE
      WHEN public.is_superadmin_safe(auth.uid()) THEN
        COALESCE(
          -- Erst: Aktive Impersonation-Session prüfen
          (SELECT s.target_tenant_id
           FROM public.impersonation_sessions s
           WHERE s.superadmin_id = auth.uid()
             AND s.status = 'active'
             AND s.mode IN ('act_as', 'view_only')
             AND s.ended_at IS NULL
             AND s.expires_at > now()
           ORDER BY s.created_at DESC
           LIMIT 1),
          -- Zweit: Tenant-Mode Session (falls vorhanden)
          (SELECT uts.tenant_company_id
           FROM public.user_tenant_sessions uts
           WHERE uts.user_id = auth.uid()
             AND uts.is_tenant_mode = true
           ORDER BY uts.updated_at DESC
           LIMIT 1)
        )
      ELSE
        COALESCE(
          -- user_tenant_sessions
          (SELECT uts.tenant_company_id
           FROM public.user_tenant_sessions uts
           WHERE uts.user_id = auth.uid()
             AND uts.is_tenant_mode = true
           ORDER BY uts.updated_at DESC
           LIMIT 1),
          -- company_id aus user_roles
          (SELECT ur.company_id
           FROM public.user_roles ur
           WHERE ur.user_id = auth.uid()
           LIMIT 1),
          -- company_id aus employees
          (SELECT e.company_id
           FROM public.employees e
           WHERE e.user_id = auth.uid()
           LIMIT 1)
        )
    END;
$$;

-- Fix: Entferne permissive SELECT-Policy, die Superadmins global Zugriff gibt.
-- Danach greift nur noch company_id=get_effective_company_id() (Policy: tasks_select_company)
DROP POLICY IF EXISTS "Users can view tasks in their company" ON public.tasks;

-- Fix: Superadmin-Bypass aus Mutations entfernen (Clean-Slate: nur im Tenant-Kontext möglich)
ALTER POLICY "Users can create tasks in their company" ON public.tasks
  WITH CHECK (company_id = public.get_effective_company_id());

ALTER POLICY "Users can update tasks in their company" ON public.tasks
  USING (company_id = public.get_effective_company_id());

ALTER POLICY "Users can delete tasks in their company" ON public.tasks
  USING (company_id = public.get_effective_company_id());

ALTER POLICY "Users can create projects in their company" ON public.projects
  WITH CHECK (company_id = public.get_effective_company_id());
