-- Beispiel-Module mit korrekter Spaltenstruktur hinzufügen
INSERT INTO public.company_modules (module_key, module_name, display_name, description, category, icon, base_price, price_per_user, is_core_module) VALUES
('hr-core', 'hr-core', 'HR Verwaltung', 'Grundlegende HR-Funktionen wie Mitarbeiterverwaltung und Stammdaten', 'hr', 'users', 49.99, 5.99, true),
('time-tracking', 'time-tracking', 'Zeiterfassung', 'Digitale Zeiterfassung mit Projekt- und Aufgabenzuordnung', 'time', 'clock', 29.99, 3.99, false),
('absence-management', 'absence-management', 'Abwesenheitsverwaltung', 'Urlaubsanträge, Krankmeldungen und Genehmigungsworkflows', 'absence', 'calendar', 39.99, 4.99, false),
('payroll', 'payroll', 'Lohnabrechnung', 'Automatisierte Lohn- und Gehaltsabrechnung', 'finance', 'calculator', 79.99, 9.99, false),
('recruiting', 'recruiting', 'Recruiting', 'Bewerbermanagement und Stellenausschreibungen', 'recruiting', 'user-check', 59.99, 7.99, false),
('performance', 'performance', 'Performance Management', 'Leistungsbeurteilungen und Zielvereinbarungen', 'performance', 'bar-chart', 49.99, 6.99, false),
('documents', 'documents', 'Dokumentenmanagement', 'Zentrale Verwaltung von HR-Dokumenten', 'documents', 'file-text', 19.99, 2.99, false),
('ai-assistant', 'ai-assistant', 'KI-Assistent', 'KI-basierte Unterstützung für HR-Prozesse', 'ai', 'brain', 99.99, 12.99, false)
ON CONFLICT (module_key) DO NOTHING;

-- RLS Policies für bestehende Tabellen
ALTER TABLE public.company_modules ENABLE ROW LEVEL SECURITY;

-- Policies für company_modules
DROP POLICY IF EXISTS "Everyone can view modules" ON public.company_modules;
CREATE POLICY "Everyone can view modules"
ON public.company_modules FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Admins can manage all modules" ON public.company_modules;
CREATE POLICY "Admins can manage all modules"
ON public.company_modules FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
);

-- Policies für company_module_assignments
DROP POLICY IF EXISTS "Admins can view assignments" ON public.company_module_assignments;
CREATE POLICY "Admins can view assignments"
ON public.company_module_assignments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
);

DROP POLICY IF EXISTS "Admins can manage all assignments" ON public.company_module_assignments;
CREATE POLICY "Admins can manage all assignments"
ON public.company_module_assignments FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
);