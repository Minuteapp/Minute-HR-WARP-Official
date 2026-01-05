-- Funktion zum Prüfen der Dokumentberechtigung basierend auf Benutzerrolle
CREATE OR REPLACE FUNCTION public.has_document_access(doc_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_user_role text;
  v_doc_created_by uuid;
  v_doc_team_id uuid;
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

  -- Admin/HR/SuperAdmin können alle Dokumente sehen
  IF v_user_role IN ('superadmin', 'admin', 'hr', 'finance_controller') THEN
    RETURN true;
  END IF;

  -- Dokument-Metadaten abrufen
  SELECT created_by, team_id INTO v_doc_created_by, v_doc_team_id
  FROM public.documents
  WHERE id = doc_id;

  -- Eigene Dokumente können immer eingesehen werden
  IF v_doc_created_by = v_user_id THEN
    RETURN true;
  END IF;

  -- Manager können Team-Dokumente sehen (falls team_id übereinstimmt)
  IF v_user_role = 'manager' AND v_doc_team_id IS NOT NULL THEN
    -- Prüfen ob Manager im gleichen Team ist
    IF EXISTS (
      SELECT 1 FROM public.employees 
      WHERE user_id = v_user_id 
      AND team_id = v_doc_team_id
    ) THEN
      RETURN true;
    END IF;
  END IF;

  -- Prüfen ob Dokument explizit freigegeben wurde
  IF EXISTS (
    SELECT 1 FROM public.document_permissions
    WHERE document_id = doc_id
    AND user_id = v_user_id
    AND (permission_level = 'read' OR permission_level = 'write' OR permission_level = 'admin')
  ) THEN
    RETURN true;
  END IF;

  RETURN false;
END;
$$;

-- RLS-Policy für Dokumente: SELECT
DROP POLICY IF EXISTS "documents_select_policy" ON public.documents;
CREATE POLICY "documents_select_policy" 
ON public.documents 
FOR SELECT 
TO authenticated
USING (public.has_document_access(id));

-- RLS-Policy für Dokumente: INSERT (alle authentifizierten Benutzer können Dokumente erstellen)
DROP POLICY IF EXISTS "documents_insert_policy" ON public.documents;
CREATE POLICY "documents_insert_policy" 
ON public.documents 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- RLS-Policy für Dokumente: UPDATE (nur Ersteller oder Admin/HR)
DROP POLICY IF EXISTS "documents_update_policy" ON public.documents;
CREATE POLICY "documents_update_policy" 
ON public.documents 
FOR UPDATE 
TO authenticated
USING (
  created_by = auth.uid() 
  OR EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role::text IN ('superadmin', 'admin', 'hr')
  )
);

-- RLS-Policy für Dokumente: DELETE (nur Admin)
DROP POLICY IF EXISTS "documents_delete_policy" ON public.documents;
CREATE POLICY "documents_delete_policy" 
ON public.documents 
FOR DELETE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role::text IN ('superadmin', 'admin')
  )
);