-- Superadmin-Policies für alle wichtigen Tabellen erstellen
-- SuperAdmins sollen vollen Zugriff auf alle Daten haben

-- Employees Tabelle
DROP POLICY IF EXISTS "SuperAdmin full access to employees" ON public.employees;
CREATE POLICY "SuperAdmin full access to employees" 
ON public.employees 
FOR ALL 
USING (is_superadmin_safe(auth.uid())) 
WITH CHECK (is_superadmin_safe(auth.uid()));

-- Tasks Tabelle
DROP POLICY IF EXISTS "SuperAdmin full access to tasks" ON public.tasks;
CREATE POLICY "SuperAdmin full access to tasks" 
ON public.tasks 
FOR ALL 
USING (is_superadmin_safe(auth.uid())) 
WITH CHECK (is_superadmin_safe(auth.uid()));

-- Time Entries Tabelle
DROP POLICY IF EXISTS "SuperAdmin full access to time_entries" ON public.time_entries;
CREATE POLICY "SuperAdmin full access to time_entries" 
ON public.time_entries 
FOR ALL 
USING (is_superadmin_safe(auth.uid())) 
WITH CHECK (is_superadmin_safe(auth.uid()));

-- Absence Requests Tabelle
DROP POLICY IF EXISTS "SuperAdmin full access to absence_requests" ON public.absence_requests;
CREATE POLICY "SuperAdmin full access to absence_requests" 
ON public.absence_requests 
FOR ALL 
USING (is_superadmin_safe(auth.uid())) 
WITH CHECK (is_superadmin_safe(auth.uid()));

-- Calendar Events Tabelle
DROP POLICY IF EXISTS "SuperAdmin full access to calendar_events" ON public.calendar_events;
CREATE POLICY "SuperAdmin full access to calendar_events" 
ON public.calendar_events 
FOR ALL 
USING (is_superadmin_safe(auth.uid())) 
WITH CHECK (is_superadmin_safe(auth.uid()));