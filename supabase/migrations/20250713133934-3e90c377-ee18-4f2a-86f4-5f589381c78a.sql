-- Aktualisiere die Tasks RLS Policies für bessere Kompatibilität

-- Lösche die existierenden Policies
DROP POLICY IF EXISTS "Task Company Isolation - SELECT" ON public.tasks;
DROP POLICY IF EXISTS "Task Company Isolation - INSERT" ON public.tasks;
DROP POLICY IF EXISTS "Task Company Isolation - UPDATE" ON public.tasks;
DROP POLICY IF EXISTS "Task Company Isolation - DELETE" ON public.tasks;

-- Neue, flexiblere Policies erstellen
CREATE POLICY "Users can view their own tasks" 
ON public.tasks 
FOR SELECT 
USING (
  -- Superadmin kann alles sehen
  is_superadmin(auth.uid()) OR
  -- Benutzer kann eigene Tasks sehen
  created_by = auth.uid() OR
  -- Benutzer kann zugewiesene Tasks sehen
  auth.uid() = ANY (COALESCE(assigned_to, ARRAY[]::uuid[])) OR
  -- Wenn company_id gesetzt ist, muss es mit der Benutzer-Company übereinstimmen
  (company_id IS NOT NULL AND company_id = get_user_company_id(auth.uid())) OR
  -- Wenn company_id NULL ist, können authentifizierte Benutzer zugreifen
  (company_id IS NULL AND auth.uid() IS NOT NULL)
);

CREATE POLICY "Users can create tasks" 
ON public.tasks 
FOR INSERT 
WITH CHECK (
  -- Benutzer kann Tasks erstellen
  auth.uid() IS NOT NULL AND
  (
    -- Entweder ohne company_id
    company_id IS NULL OR
    -- Oder mit passender company_id
    company_id = get_user_company_id(auth.uid()) OR
    -- Oder als Superadmin
    is_superadmin(auth.uid())
  )
);

CREATE POLICY "Users can update their own tasks" 
ON public.tasks 
FOR UPDATE 
USING (
  is_superadmin(auth.uid()) OR
  created_by = auth.uid() OR
  auth.uid() = ANY (COALESCE(assigned_to, ARRAY[]::uuid[])) OR
  (company_id IS NOT NULL AND company_id = get_user_company_id(auth.uid())) OR
  (company_id IS NULL AND auth.uid() IS NOT NULL)
);

CREATE POLICY "Users can delete their own tasks" 
ON public.tasks 
FOR DELETE 
USING (
  is_superadmin(auth.uid()) OR
  created_by = auth.uid()
);