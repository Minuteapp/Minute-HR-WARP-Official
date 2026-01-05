-- Funktion zum Prüfen der Krankmeldungs-Berechtigung basierend auf Benutzerrolle
CREATE OR REPLACE FUNCTION public.has_sick_leave_access(sick_leave_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_user_role text;
  v_sick_leave_user_id uuid;
  v_sick_leave_team_id uuid;
BEGIN
  -- Aktuellen Benutzer ermitteln
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN false;
  END IF;

  -- Höchste Rolle des Benutzers ermitteln
  SELECT role::text INTO v_user_role
  FROM public.user_roles
  WHERE user_id = v_user_id
  ORDER BY 
    CASE role::text
      WHEN 'superadmin' THEN 1
      WHEN 'admin' THEN 2
      WHEN 'hr' THEN 3
      WHEN 'finance_controller' THEN 4
      WHEN 'manager' THEN 5
      ELSE 6
    END
  LIMIT 1;

  -- Wenn keine Rolle gefunden, als employee behandeln
  IF v_user_role IS NULL THEN
    v_user_role := 'employee';
  END IF;

  -- Admin/HR/SuperAdmin können alle Krankmeldungen sehen
  IF v_user_role IN ('superadmin', 'admin', 'hr', 'finance_controller') THEN
    RETURN true;
  END IF;

  -- Krankmeldungs-Metadaten abrufen
  SELECT user_id, team_id INTO v_sick_leave_user_id, v_sick_leave_team_id
  FROM public.sick_leaves
  WHERE id = sick_leave_id;

  -- Eigene Krankmeldungen können immer eingesehen werden
  IF v_sick_leave_user_id = v_user_id THEN
    RETURN true;
  END IF;

  -- Manager können Team-Krankmeldungen sehen
  IF v_user_role = 'manager' AND v_sick_leave_team_id IS NOT NULL THEN
    IF EXISTS (
      SELECT 1 FROM public.employees 
      WHERE user_id = v_user_id 
      AND team_id = v_sick_leave_team_id
    ) THEN
      RETURN true;
    END IF;
  END IF;

  RETURN false;
END;
$$;

-- RLS-Policy für sick_leaves: SELECT
DROP POLICY IF EXISTS "sick_leaves_select_policy" ON public.sick_leaves;
CREATE POLICY "sick_leaves_select_policy" 
ON public.sick_leaves 
FOR SELECT 
TO authenticated
USING (public.has_sick_leave_access(id));

-- RLS-Policy für sick_leaves: INSERT (alle authentifizierten Benutzer können Krankmeldungen erstellen)
DROP POLICY IF EXISTS "sick_leaves_insert_policy" ON public.sick_leaves;
CREATE POLICY "sick_leaves_insert_policy" 
ON public.sick_leaves 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- RLS-Policy für sick_leaves: UPDATE (Ersteller oder Admin/HR/Manager)
DROP POLICY IF EXISTS "sick_leaves_update_policy" ON public.sick_leaves;
CREATE POLICY "sick_leaves_update_policy" 
ON public.sick_leaves 
FOR UPDATE 
TO authenticated
USING (
  user_id = auth.uid() 
  OR EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role::text IN ('superadmin', 'admin', 'hr', 'manager')
  )
);

-- RLS-Policy für sick_leaves: DELETE (nur Admin)
DROP POLICY IF EXISTS "sick_leaves_delete_policy" ON public.sick_leaves;
CREATE POLICY "sick_leaves_delete_policy" 
ON public.sick_leaves 
FOR DELETE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role::text IN ('superadmin', 'admin')
  )
);