-- Beispiel-Module hinzufügen falls die Tabelle leer ist
INSERT INTO public.company_modules (module_key, name, description, category, icon, base_price, billing_type, features) VALUES
('hr-core', 'HR Verwaltung', 'Grundlegende HR-Funktionen wie Mitarbeiterverwaltung und Stammdaten', 'hr', 'users', 49.99, 'monthly', '["Mitarbeiterverwaltung", "Stammdaten", "Organigramm"]'),
('time-tracking', 'Zeiterfassung', 'Digitale Zeiterfassung mit Projekt- und Aufgabenzuordnung', 'time', 'clock', 29.99, 'monthly', '["Stempeluhr", "Projektzeiten", "Berichte"]'),
('absence-management', 'Abwesenheitsverwaltung', 'Urlaubsanträge, Krankmeldungen und Genehmigungsworkflows', 'absence', 'calendar', 39.99, 'monthly', '["Urlaubsanträge", "Genehmigungsworkflow", "Abwesenheitskalender"]'),
('payroll', 'Lohnabrechnung', 'Automatisierte Lohn- und Gehaltsabrechnung', 'finance', 'calculator', 79.99, 'monthly', '["Lohnabrechnung", "Steuerberechnung", "SEPA Export"]'),
('recruiting', 'Recruiting', 'Bewerbermanagement und Stellenausschreibungen', 'recruiting', 'user-check', 59.99, 'monthly', '["Bewerbermanagement", "Stellenportal", "Interview-Planung"]'),
('performance', 'Performance Management', 'Leistungsbeurteilungen und Zielvereinbarungen', 'performance', 'bar-chart', 49.99, 'monthly', '["360° Feedback", "Zielvereinbarungen", "Entwicklungspläne"]'),
('documents', 'Dokumentenmanagement', 'Zentrale Verwaltung von HR-Dokumenten', 'documents', 'file-text', 19.99, 'monthly', '["Dokumentenarchiv", "Versionierung", "Zugriffsrechte"]'),
('ai-assistant', 'KI-Assistent', 'KI-basierte Unterstützung für HR-Prozesse', 'ai', 'brain', 99.99, 'monthly', '["Chatbot", "Automatisierung", "Predictive Analytics"]')
ON CONFLICT (module_key) DO NOTHING;

-- Einfache RLS Policies erstellen
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