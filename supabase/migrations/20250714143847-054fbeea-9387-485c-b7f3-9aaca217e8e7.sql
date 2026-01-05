-- HR App RLS Policies für Mitarbeiterdaten

-- Erstelle Hilfsfunktionen für bessere Policy-Verwaltung
CREATE OR REPLACE FUNCTION public.is_hr_staff(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = $1 
    AND role IN ('hr', 'admin', 'superadmin')
  );
$$;

CREATE OR REPLACE FUNCTION public.is_manager(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = $1 
    AND role IN ('manager', 'admin', 'superadmin')
  );
$$;

CREATE OR REPLACE FUNCTION public.is_team_manager(user_id uuid, employee_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.employees e1
    JOIN public.employees e2 ON e1.team = e2.team
    WHERE e1.id = user_id 
    AND e2.id = employee_id
    AND EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = user_id 
      AND ur.role IN ('manager', 'admin', 'superadmin')
    )
  );
$$;

-- Employees Tabelle RLS Policies
DROP POLICY IF EXISTS "Employees can view own data" ON public.employees;
DROP POLICY IF EXISTS "HR can view all employees" ON public.employees;
DROP POLICY IF EXISTS "Managers can view team employees" ON public.employees;
DROP POLICY IF EXISTS "Public employee directory access" ON public.employees;

CREATE POLICY "Employees can view own data" 
ON public.employees 
FOR SELECT 
TO authenticated
USING (
  id = auth.uid() OR
  (SELECT id FROM public.profiles WHERE id = auth.uid()) = employees.id
);

CREATE POLICY "HR staff can view all employees" 
ON public.employees 
FOR SELECT 
TO authenticated
USING (public.is_hr_staff(auth.uid()));

CREATE POLICY "Managers can view team employees" 
ON public.employees 
FOR SELECT 
TO authenticated
USING (
  public.is_manager(auth.uid()) AND
  public.is_team_manager(auth.uid(), employees.id)
);

CREATE POLICY "HR staff can manage employees" 
ON public.employees 
FOR ALL 
TO authenticated
USING (public.is_hr_staff(auth.uid()))
WITH CHECK (public.is_hr_staff(auth.uid()));

CREATE POLICY "Employees can update own basic data" 
ON public.employees 
FOR UPDATE 
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Employee Contracts RLS Policies
DROP POLICY IF EXISTS "Employee contracts access" ON public.employee_contracts;

CREATE POLICY "Employees can view own contracts" 
ON public.employee_contracts 
FOR SELECT 
TO authenticated
USING (
  user_id = auth.uid() OR
  public.is_hr_staff(auth.uid()) OR
  (public.is_manager(auth.uid()) AND public.is_team_manager(auth.uid(), user_id))
);

CREATE POLICY "HR can manage contracts" 
ON public.employee_contracts 
FOR ALL 
TO authenticated
USING (public.is_hr_staff(auth.uid()))
WITH CHECK (public.is_hr_staff(auth.uid()));

-- Profiles Tabelle RLS Policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "HR can view all profiles" ON public.profiles;

CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (id = auth.uid());

CREATE POLICY "HR staff can view all profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (public.is_hr_staff(auth.uid()));

CREATE POLICY "Basic profile info is viewable by colleagues" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (true); -- Basis-Profildaten für Kollegenbuch

CREATE POLICY "Users can update own profile" 
ON public.profiles 
FOR UPDATE 
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

CREATE POLICY "HR can manage profiles" 
ON public.profiles 
FOR ALL 
TO authenticated
USING (public.is_hr_staff(auth.uid()))
WITH CHECK (public.is_hr_staff(auth.uid()));

-- Performance Reviews RLS Policies
DROP POLICY IF EXISTS "Performance reviews access" ON public.performance_reviews;

CREATE POLICY "Employees can view own reviews" 
ON public.performance_reviews 
FOR SELECT 
TO authenticated
USING (
  employee_id = auth.uid() OR
  reviewer_id = auth.uid() OR
  public.is_hr_staff(auth.uid()) OR
  (public.is_manager(auth.uid()) AND public.is_team_manager(auth.uid(), employee_id))
);

CREATE POLICY "Managers can create team reviews" 
ON public.performance_reviews 
FOR INSERT 
TO authenticated
WITH CHECK (
  public.is_manager(auth.uid()) AND 
  (public.is_team_manager(auth.uid(), employee_id) OR public.is_hr_staff(auth.uid()))
);

CREATE POLICY "Reviewers can update assigned reviews" 
ON public.performance_reviews 
FOR UPDATE 
TO authenticated
USING (
  reviewer_id = auth.uid() OR
  public.is_hr_staff(auth.uid())
)
WITH CHECK (
  reviewer_id = auth.uid() OR
  public.is_hr_staff(auth.uid())
);

-- Time Entries RLS Policies  
DROP POLICY IF EXISTS "Time entries access" ON public.time_entries;

CREATE POLICY "Employees can manage own time entries" 
ON public.time_entries 
FOR ALL 
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "HR can view all time entries" 
ON public.time_entries 
FOR SELECT 
TO authenticated
USING (public.is_hr_staff(auth.uid()));

CREATE POLICY "Managers can view team time entries" 
ON public.time_entries 
FOR SELECT 
TO authenticated
USING (
  public.is_manager(auth.uid()) AND
  public.is_team_manager(auth.uid(), user_id)
);

-- Payroll Calculations RLS Policies
DROP POLICY IF EXISTS "Payroll access" ON public.payroll_calculations;

CREATE POLICY "Employees can view own payroll" 
ON public.payroll_calculations 
FOR SELECT 
TO authenticated
USING (
  user_id = auth.uid() OR
  public.is_hr_staff(auth.uid())
);

CREATE POLICY "HR can manage payroll" 
ON public.payroll_calculations 
FOR ALL 
TO authenticated
USING (public.is_hr_staff(auth.uid()))
WITH CHECK (public.is_hr_staff(auth.uid()));

-- Employee Documents RLS Policies
DROP POLICY IF EXISTS "Employee documents access" ON public.employee_documents;

CREATE POLICY "Employees can view own documents" 
ON public.employee_documents 
FOR SELECT 
TO authenticated
USING (
  employee_id = auth.uid() OR
  public.is_hr_staff(auth.uid())
);

CREATE POLICY "Employees can upload own documents" 
ON public.employee_documents 
FOR INSERT 
TO authenticated
WITH CHECK (employee_id = auth.uid());

CREATE POLICY "HR can manage all documents" 
ON public.employee_documents 
FOR ALL 
TO authenticated
USING (public.is_hr_staff(auth.uid()))
WITH CHECK (public.is_hr_staff(auth.uid()));

-- User Roles - strenge Kontrolle
DROP POLICY IF EXISTS "Role management" ON public.user_roles;

CREATE POLICY "Users can view own roles" 
ON public.user_roles 
FOR SELECT 
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all roles" 
ON public.user_roles 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role IN ('admin', 'superadmin')
  )
);

CREATE POLICY "Only superadmins can manage roles" 
ON public.user_roles 
FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'superadmin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'superadmin'
  )
);

-- Companies Tabelle - Firmenspezifische Isolation
DROP POLICY IF EXISTS "Company data isolation" ON public.companies;

CREATE POLICY "Users can view own company" 
ON public.companies 
FOR SELECT 
TO authenticated
USING (
  id IN (
    SELECT company_id FROM public.employees 
    WHERE employees.id = auth.uid()
  ) OR
  public.is_hr_staff(auth.uid())
);

CREATE POLICY "Admins can manage companies" 
ON public.companies 
FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role IN ('admin', 'superadmin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role IN ('admin', 'superadmin')
  )
);

-- Security Audit Logs - nur für Admins
DROP POLICY IF EXISTS "Audit logs access" ON public.security_audit_logs;

CREATE POLICY "Only admins can view audit logs" 
ON public.security_audit_logs 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role IN ('admin', 'superadmin')
  )
);

-- Stelle sicher, dass RLS auf allen relevanten Tabellen aktiviert ist
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_audit_logs ENABLE ROW LEVEL SECURITY;