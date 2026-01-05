-- Insert sample data for HR Helpdesk module

-- First, insert ticket categories
INSERT INTO public.ticket_categories (name, description, color, icon, sla_hours, auto_assign_department, requires_legal_review) VALUES
('Payroll', 'Lohn- und Gehaltsabrechnungen, Überstunden, Boni', '#10B981', 'DollarSign', 24, 'hr', false),
('Urlaub', 'Urlaubsanträge, Sonderurlaub, Krankmeldungen', '#3B82F6', 'Calendar', 48, 'hr', false),
('Vertrag', 'Arbeitsverträge, Änderungen, Kündigungen', '#F59E0B', 'FileText', 72, 'legal', true),
('Benefits', 'Sozialleistungen, Betriebsrente, Firmenwagen', '#8B5CF6', 'Gift', 48, 'hr', false),
('Compliance', 'Datenschutz, Arbeitsschutz, Audit-Fragen', '#EF4444', 'Shield', 24, 'legal', true),
('IT-Support', 'Hardware, Software, Zugriffe', '#06B6D4', 'Monitor', 12, 'it', false),
('Recruiting', 'Bewerbungen, Onboarding, Referenzen', '#84CC16', 'Users', 48, 'hr', false),
('Arbeitszeiten', 'Zeiterfassung, Überstunden, Schichtpläne', '#6366F1', 'Clock', 24, 'hr', false),
('Training', 'Weiterbildung, Schulungen, Zertifikate', '#EC4899', 'BookOpen', 72, 'hr', false),
('Sonstiges', 'Allgemeine Anfragen und andere Themen', '#6B7280', 'HelpCircle', 48, 'hr', false);

-- Insert SLA policies for each category and priority
INSERT INTO public.ticket_sla_policies (category_id, priority, response_time_hours, resolution_time_hours) 
SELECT 
  tc.id,
  priority_level,
  CASE 
    WHEN priority_level = 'critical' THEN 2
    WHEN priority_level = 'high' THEN 4
    ELSE 8
  END as response_time,
  CASE 
    WHEN priority_level = 'critical' THEN tc.sla_hours / 2
    WHEN priority_level = 'high' THEN tc.sla_hours
    ELSE tc.sla_hours * 2
  END as resolution_time
FROM public.ticket_categories tc
CROSS JOIN (VALUES ('normal'), ('high'), ('critical')) AS p(priority_level);

-- Insert FAQ categories
INSERT INTO public.faq_categories (name, description, icon, color, sort_order) VALUES
('Häufige Fragen', 'Die wichtigsten Fragen und Antworten', 'Star', '#F59E0B', 1),
('Payroll', 'Fragen zu Lohn und Gehalt', 'DollarSign', '#10B981', 2),
('Urlaub & Abwesenheit', 'Informationen zu Urlaubsregelungen', 'Calendar', '#3B82F6', 3),
('IT & Technik', 'Computer, Software und Systemzugang', 'Monitor', '#06B6D4', 4),
('Benefits & Sozialleistungen', 'Zusatzleistungen und Vergünstigungen', 'Gift', '#8B5CF6', 5),
('Arbeitsrecht', 'Rechtliche Fragen und Bestimmungen', 'Scale', '#EF4444', 6);

-- Insert sample FAQ articles
INSERT INTO public.faq_articles (category_id, title, content, summary, keywords, is_featured) VALUES
(
  (SELECT id FROM public.faq_categories WHERE name = 'Häufige Fragen' LIMIT 1),
  'Wie beantrage ich Urlaub?',
  'Um Urlaub zu beantragen, gehen Sie wie folgt vor:\n\n1. Öffnen Sie das Absence-Modul\n2. Klicken Sie auf "Neuen Antrag erstellen"\n3. Wählen Sie die Urlaubstage aus\n4. Fügen Sie eine Begründung hinzu\n5. Reichen Sie den Antrag ein\n\nIhr Vorgesetzter wird automatisch benachrichtigt und kann den Antrag genehmigen.',
  'Schritt-für-Schritt Anleitung zur Urlaubsbeantragung',
  '["urlaub", "antrag", "genehmigung", "absence"]',
  true
),
(
  (SELECT id FROM public.faq_categories WHERE name = 'Payroll' LIMIT 1),
  'Wann erhalte ich meine Gehaltsabrechnung?',
  'Gehaltsabrechnungen werden monatlich bis zum 25. des Monats erstellt und per E-Mail versandt. Sie finden Ihre Abrechnungen auch jederzeit im Payroll-Bereich der HR-App unter "Meine Abrechnungen".',
  'Informationen zu Gehaltsabrechnungen und deren Verfügbarkeit',
  '["gehalt", "abrechnung", "payroll", "lohn"]',
  true
),
(
  (SELECT id FROM public.faq_categories WHERE name = 'IT & Technik' LIMIT 1),
  'Passwort zurücksetzen',
  'Wenn Sie Ihr Passwort vergessen haben:\n\n1. Gehen Sie zur Login-Seite\n2. Klicken Sie auf "Passwort vergessen"\n3. Geben Sie Ihre E-Mail-Adresse ein\n4. Folgen Sie den Anweisungen in der E-Mail\n\nAlternativ können Sie sich direkt an die IT-Abteilung wenden.',
  'Anleitung zum Zurücksetzen des Passworts',
  '["passwort", "login", "zugang", "reset"]',
  false
);

-- Insert ticket templates
INSERT INTO public.ticket_templates (category_id, title, content, tags) VALUES
(
  (SELECT id FROM public.ticket_categories WHERE name = 'Payroll' LIMIT 1),
  'Gehaltskorrektur beantragen',
  'Sehr geehrte Damen und Herren,\n\nbitte prüfen Sie meine Gehaltsabrechnung für den Monat [MONAT/JAHR]. Ich habe folgende Unstimmigkeit festgestellt:\n\n[BESCHREIBUNG DER UNSTIMMIGKEIT]\n\nAnbei finden Sie die relevanten Unterlagen.\n\nVielen Dank für die Bearbeitung.',
  '["gehaltskorrektur", "payroll", "abrechnung"]'
),
(
  (SELECT id FROM public.ticket_categories WHERE name = 'IT-Support' LIMIT 1),
  'Hardware-Problem melden',
  'Hiermit melde ich ein Problem mit meiner Hardware:\n\nGerät: [GERÄTENAME]\nProblem: [PROBLEMBESCHREIBUNG]\nFehlermeldung (falls vorhanden): [FEHLERMELDUNG]\nErste Auftreten: [DATUM/ZEIT]\n\nIch habe bereits folgende Schritte unternommen:\n- [SCHRITT 1]\n- [SCHRITT 2]\n\nBitte um zeitnahe Bearbeitung.',
  '["hardware", "it-support", "defekt"]'
);

-- Sample employee data for tickets (using existing user structure)
DO $$
DECLARE
  sample_user_id UUID := 'e7219c39-dbe0-45f3-a6b8-cbbf20517bb2'; -- SuperAdmin ID
  payroll_cat_id UUID;
  urlaub_cat_id UUID;
  it_cat_id UUID;
  i INTEGER;
BEGIN
  -- Get category IDs
  SELECT id INTO payroll_cat_id FROM public.ticket_categories WHERE name = 'Payroll' LIMIT 1;
  SELECT id INTO urlaub_cat_id FROM public.ticket_categories WHERE name = 'Urlaub' LIMIT 1;
  SELECT id INTO it_cat_id FROM public.ticket_categories WHERE name = 'IT-Support' LIMIT 1;

  -- Generate 100 sample tickets with realistic distribution
  FOR i IN 1..100 LOOP
    INSERT INTO public.tickets (
      title, 
      description, 
      status, 
      priority, 
      category_id, 
      created_by, 
      department, 
      employee_name,
      source_channel,
      contains_sensitive_data,
      created_at
    ) VALUES (
      CASE (i % 10)
        WHEN 0 THEN 'Gehaltsabrechnung ' || (i/10 + 1) || ' prüfen'
        WHEN 1 THEN 'Urlaubsantrag für ' || (ARRAY['Dezember', 'Januar', 'Februar', 'März'])[((i/10) % 4) + 1]
        WHEN 2 THEN 'Computer startet nicht - Arbeitsplatz ' || i
        WHEN 3 THEN 'Überstunden im ' || (ARRAY['Oktober', 'November', 'Dezember'])[((i/10) % 3) + 1] || ' klären'
        WHEN 4 THEN 'Krankmeldung einreichen'
        WHEN 5 THEN 'Benefits-Programm Frage'
        WHEN 6 THEN 'Arbeitsvertrag Änderung'
        WHEN 7 THEN 'Software-Lizenz Problem'
        WHEN 8 THEN 'Onboarding neuer Mitarbeiter'
        ELSE 'Allgemeine HR Anfrage #' || i
      END,
      
      CASE (i % 10)
        WHEN 0 THEN 'Bitte überprüfen Sie meine Gehaltsabrechnung. Es scheint eine Differenz bei den Überstunden zu geben.'
        WHEN 1 THEN 'Ich möchte Urlaub beantragen für die Feiertage. Sind noch Tage verfügbar?'
        WHEN 2 THEN 'Mein Computer lässt sich seit heute Morgen nicht mehr starten. Dringend benötigt für Präsentation.'
        WHEN 3 THEN 'Meine Überstunden vom letzten Monat wurden nicht korrekt abgerechnet. Bitte prüfen.'
        WHEN 4 THEN 'Ich bin erkrankt und möchte die Krankmeldung digital einreichen.'
        WHEN 5 THEN 'Kann ich das Jobrad-Programm nutzen? Wie ist der Prozess?'
        WHEN 6 THEN 'Ich möchte meine Arbeitszeit von Vollzeit auf Teilzeit ändern.'
        WHEN 7 THEN 'Office 365 Lizenz ist abgelaufen, kann nicht mehr arbeiten.'
        WHEN 8 THEN 'Neuer Kollege startet nächste Woche, welche Unterlagen werden benötigt?'
        ELSE 'Ich habe eine allgemeine Frage bezüglich HR-Prozessen.'
      END,
      
      (ARRAY['new', 'in_progress', 'waiting_for_user', 'resolved'])[((i % 4) + 1)],
      (ARRAY['normal', 'high', 'critical'])[((i % 3) + 1)],
      
      CASE (i % 10)
        WHEN 0,3 THEN payroll_cat_id
        WHEN 1,4 THEN urlaub_cat_id
        WHEN 2,7 THEN it_cat_id
        ELSE (SELECT id FROM public.ticket_categories ORDER BY random() LIMIT 1)
      END,
      
      sample_user_id,
      (ARRAY['Engineering', 'Sales', 'Marketing', 'HR', 'Finance'])[((i % 5) + 1)],
      'Max Mustermann',
      (ARRAY['app', 'web', 'email'])[((i % 3) + 1)],
      (i % 10 = 0), -- Every 10th ticket contains sensitive data
      NOW() - INTERVAL '1 day' * (i % 30) -- Spread tickets over last 30 days
    );
  END LOOP;
END $$;