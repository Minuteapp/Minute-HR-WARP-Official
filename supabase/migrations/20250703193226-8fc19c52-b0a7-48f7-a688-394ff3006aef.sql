-- Bereinige alle bestehenden RLS-Policies für documents
DROP POLICY IF EXISTS "Administratoren haben vollen Zugriff auf Dokumente" ON public.documents;
DROP POLICY IF EXISTS "Allow authenticated users to insert documents" ON public.documents;
DROP POLICY IF EXISTS "Allow authenticated users to view documents" ON public.documents;
DROP POLICY IF EXISTS "Allow users to delete their own documents" ON public.documents;
DROP POLICY IF EXISTS "Allow users to update their own documents" ON public.documents;
DROP POLICY IF EXISTS "Basic document access" ON public.documents;
DROP POLICY IF EXISTS "Benutzer können Dokumente mit expliziten Berechtigungen sehen" ON public.documents;
DROP POLICY IF EXISTS "Benutzer können ihre eigenen Dokumente verwalten" ON public.documents;
DROP POLICY IF EXISTS "Users can create documents" ON public.documents;
DROP POLICY IF EXISTS "Users can create their own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can delete their own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can insert documents" ON public.documents;
DROP POLICY IF EXISTS "Users can insert their own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can update their own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can view documents they have access to" ON public.documents;
DROP POLICY IF EXISTS "Users can view their own documents" ON public.documents;
DROP POLICY IF EXISTS "enable_all_access_for_authenticated_users" ON public.documents;

-- Erstelle einfache, klare RLS-Policies ohne Rekursion
CREATE POLICY "documents_select_policy" ON public.documents
  FOR SELECT 
  USING (
    auth.uid() IS NOT NULL AND (
      created_by = auth.uid() OR
      EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() 
        AND role IN ('admin', 'superadmin')
      )
    )
  );

CREATE POLICY "documents_insert_policy" ON public.documents
  FOR INSERT 
  WITH CHECK (
    auth.uid() IS NOT NULL AND 
    created_by = auth.uid()
  );

CREATE POLICY "documents_update_policy" ON public.documents
  FOR UPDATE 
  USING (
    auth.uid() IS NOT NULL AND (
      created_by = auth.uid() OR
      EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() 
        AND role IN ('admin', 'superadmin')
      )
    )
  );

CREATE POLICY "documents_delete_policy" ON public.documents
  FOR DELETE 
  USING (
    auth.uid() IS NOT NULL AND (
      created_by = auth.uid() OR
      EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() 
        AND role IN ('admin', 'superadmin')
      )
    )
  );