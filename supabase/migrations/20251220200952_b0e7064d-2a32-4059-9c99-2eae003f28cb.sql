
-- TESTDATEN FINALE VERSION (alle Spalten korrigiert)

-- 1. PROJECTS
INSERT INTO projects (name, description, status, priority, progress, owner_id, budget, start_date, end_date, category, project_type, company_id) VALUES
('Website Relaunch', 'Komplette Neugestaltung der Firmenwebsite', 'active', 'high', 35, 'a039669c-69f0-446b-9487-1c2d447c89ae', 50000, '2025-01-01', '2025-06-30', 'IT', 'standard', '00000000-0000-0000-0000-000000000001'),
('ERP Migration', 'Migration des ERP-Systems auf Cloud', 'active', 'high', 15, 'a039669c-69f0-446b-9487-1c2d447c89ae', 120000, '2025-02-01', '2025-12-31', 'IT', 'standard', '00000000-0000-0000-0000-000000000001'),
('Mitarbeiter-Schulung 2025', 'Jährliches Schulungsprogramm', 'pending', 'medium', 0, 'a039669c-69f0-446b-9487-1c2d447c89ae', 25000, '2025-03-01', '2025-11-30', 'HR', 'standard', '00000000-0000-0000-0000-000000000001'),
('Büroerweiterung Nord', 'Erweiterung Büroflächen 2. Stock', 'blocked', 'low', 60, 'a039669c-69f0-446b-9487-1c2d447c89ae', 80000, '2024-09-01', '2025-04-30', 'Facility', 'standard', '00000000-0000-0000-0000-000000000001'),
('DSGVO Compliance Audit', 'Jährliche Datenschutz-Prüfung', 'completed', 'high', 100, 'a039669c-69f0-446b-9487-1c2d447c89ae', 15000, '2024-10-01', '2024-12-15', 'Compliance', 'standard', '00000000-0000-0000-0000-000000000001');

-- 2. TICKETS
INSERT INTO tickets (subject, description, status, priority, created_by, department, company_id) VALUES
('Drucker im 3. OG funktioniert nicht', 'Netzwerkdrucker zeigt Papierstau an.', 'open', 'high', 'a039669c-69f0-446b-9487-1c2d447c89ae', 'IT-Support', '00000000-0000-0000-0000-000000000001'),
('Zugang zu SharePoint benötigt', 'Neuer Mitarbeiter benötigt Zugang.', 'in_progress', 'medium', 'a039669c-69f0-446b-9487-1c2d447c89ae', 'IT-Support', '00000000-0000-0000-0000-000000000001'),
('VPN-Verbindung instabil', 'VPN bricht nach 30 Minuten ab.', 'open', 'high', 'a039669c-69f0-446b-9487-1c2d447c89ae', 'IT-Support', '00000000-0000-0000-0000-000000000001'),
('Urlaubsantrag nicht bearbeitet', 'Antrag vom 10.12. noch offen.', 'resolved', 'low', 'a039669c-69f0-446b-9487-1c2d447c89ae', 'HR', '00000000-0000-0000-0000-000000000001'),
('Software-Installation anfordern', 'Adobe Creative Suite benötigt.', 'waiting_response', 'medium', 'a039669c-69f0-446b-9487-1c2d447c89ae', 'IT-Support', '00000000-0000-0000-0000-000000000001');

-- 3. NOTIFICATIONS
INSERT INTO notifications (user_id, title, message, type, read) VALUES
('a039669c-69f0-446b-9487-1c2d447c89ae', 'Projekt aktualisiert', 'Website Relaunch auf 35% aktualisiert.', 'project', false),
('a039669c-69f0-446b-9487-1c2d447c89ae', 'Neue Aufgabe zugewiesen', 'Design-Review für Homepage', 'task', false),
('a039669c-69f0-446b-9487-1c2d447c89ae', 'Urlaubsantrag genehmigt', 'Urlaub 24.-26.12. genehmigt.', 'absence', true),
('a039669c-69f0-446b-9487-1c2d447c89ae', 'Meeting-Erinnerung', 'Sprint Planning morgen 10 Uhr', 'calendar', false),
('a039669c-69f0-446b-9487-1c2d447c89ae', 'Budget-Warnung', 'ERP Migration erreicht 80%', 'budget', false);

-- 4. TASKS
INSERT INTO tasks (title, description, priority, status, due_date, progress, completed, created_by, company_id) VALUES
('Homepage Design finalisieren', 'Design mit Stakeholdern abstimmen', 'high', 'in-progress', '2025-01-15', 60, false, 'a039669c-69f0-446b-9487-1c2d447c89ae', '00000000-0000-0000-0000-000000000001'),
('Datenmigration planen', 'Migrationsplan erstellen', 'high', 'todo', '2025-02-01', 0, false, 'a039669c-69f0-446b-9487-1c2d447c89ae', '00000000-0000-0000-0000-000000000001'),
('Schulungsunterlagen erstellen', 'PowerPoint und Handouts', 'medium', 'todo', '2025-02-28', 0, false, 'a039669c-69f0-446b-9487-1c2d447c89ae', '00000000-0000-0000-0000-000000000001'),
('DSGVO Dokumentation aktualisieren', 'Datenschutz-Dokumente updaten', 'medium', 'done', '2024-12-10', 100, true, 'a039669c-69f0-446b-9487-1c2d447c89ae', '00000000-0000-0000-0000-000000000001'),
('Vendor-Meeting vorbereiten', 'Präsentation vorbereiten', 'low', 'in-progress', '2025-01-10', 40, false, 'a039669c-69f0-446b-9487-1c2d447c89ae', '00000000-0000-0000-0000-000000000001');

-- 5. ROADMAPS (ohne company_id)
INSERT INTO roadmaps (title, description, vision, status, start_date, end_date, created_by, priority, progress) VALUES
('Digitale Transformation 2025', 'Strategische Roadmap für Digitalisierung', 'Marktführer werden', 'active', '2025-01-01', '2025-12-31', 'a039669c-69f0-446b-9487-1c2d447c89ae', 'high', 10),
('HR Modernisierung', 'HR-Prozesse modernisieren', 'Beste Arbeitgebererfahrung', 'active', '2025-01-01', '2025-06-30', 'a039669c-69f0-446b-9487-1c2d447c89ae', 'medium', 25),
('Nachhaltigkeitsstrategie', 'Nachhaltige Geschäftspraktiken', 'CO2-neutral 2027', 'draft', '2025-04-01', '2027-12-31', 'a039669c-69f0-446b-9487-1c2d447c89ae', 'medium', 0);

-- 6. CALENDAR_EVENTS
INSERT INTO calendar_events (title, description, start_time, end_time, location, status, is_all_day, type, priority, created_by, color, company_id) VALUES
('Sprint Planning Q1', 'Quartalsplanung', '2025-01-06 10:00:00+01', '2025-01-06 12:00:00+01', 'Konferenzraum A', 'confirmed', false, 'meeting', 'high', 'a039669c-69f0-446b-9487-1c2d447c89ae', '#3b82f6', '00000000-0000-0000-0000-000000000001'),
('Website Review', 'Design-Review', '2025-01-08 14:00:00+01', '2025-01-08 15:30:00+01', 'Konferenzraum B', 'confirmed', false, 'meeting', 'medium', 'a039669c-69f0-446b-9487-1c2d447c89ae', '#8b5cf6', '00000000-0000-0000-0000-000000000001'),
('ERP Vendor Präsentation', 'Anbieter-Meeting', '2025-01-15 09:00:00+01', '2025-01-15 11:00:00+01', 'Hauptkonferenzraum', 'confirmed', false, 'meeting', 'high', 'a039669c-69f0-446b-9487-1c2d447c89ae', '#ef4444', '00000000-0000-0000-0000-000000000001'),
('All-Hands Meeting', 'Unternehmens-Update', '2025-01-31 16:00:00+01', '2025-01-31 17:00:00+01', 'Kantine', 'confirmed', false, 'meeting', 'medium', 'a039669c-69f0-446b-9487-1c2d447c89ae', '#f59e0b', '00000000-0000-0000-0000-000000000001');
