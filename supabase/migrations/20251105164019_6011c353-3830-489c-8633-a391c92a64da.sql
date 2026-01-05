-- Erstelle Tabelle für HR-Notizen
CREATE TABLE IF NOT EXISTS public.employee_hr_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('performance_review', 'compensation', 'project', 'work_arrangement', 'onboarding', 'disciplinary', 'health', 'career_development', 'other')),
  tags TEXT[],
  visibility TEXT NOT NULL DEFAULT 'hr_only' CHECK (visibility IN ('hr_only', 'hr_and_manager')),
  has_attachments BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- Index für Performance
CREATE INDEX IF NOT EXISTS idx_employee_hr_notes_employee_id ON public.employee_hr_notes(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_hr_notes_created_at ON public.employee_hr_notes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_employee_hr_notes_category ON public.employee_hr_notes(category);

-- Row-Level Security aktivieren
ALTER TABLE public.employee_hr_notes ENABLE ROW LEVEL SECURITY;

-- RLS-Richtlinie für Lesen (Alle authentifizierten Benutzer können lesen)
CREATE POLICY "Authentifizierte Benutzer können Notizen lesen" 
  ON public.employee_hr_notes 
  FOR SELECT 
  USING (auth.uid() IS NOT NULL);

-- RLS-Richtlinie für Einfügen (Alle authentifizierten Benutzer können erstellen)
CREATE POLICY "Authentifizierte Benutzer können Notizen erstellen" 
  ON public.employee_hr_notes 
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL AND author_id = auth.uid());

-- RLS-Richtlinie für Bearbeiten (Nur eigene Notizen)
CREATE POLICY "Benutzer können eigene Notizen bearbeiten" 
  ON public.employee_hr_notes 
  FOR UPDATE 
  USING (auth.uid() = author_id);

-- RLS-Richtlinie für Löschen (Nur eigene Notizen)
CREATE POLICY "Benutzer können eigene Notizen löschen" 
  ON public.employee_hr_notes 
  FOR DELETE 
  USING (auth.uid() = author_id);

-- Erstelle Tabelle für HR-Notizen-Anhänge
CREATE TABLE IF NOT EXISTS public.employee_hr_note_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  note_id UUID NOT NULL REFERENCES public.employee_hr_notes(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  file_type TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  uploaded_by UUID REFERENCES auth.users(id)
);

-- Index für Performance
CREATE INDEX IF NOT EXISTS idx_employee_hr_note_attachments_note_id ON public.employee_hr_note_attachments(note_id);

-- Row-Level Security aktivieren
ALTER TABLE public.employee_hr_note_attachments ENABLE ROW LEVEL SECURITY;

-- RLS-Richtlinie für Lesen
CREATE POLICY "Authentifizierte Benutzer können Anhänge lesen" 
  ON public.employee_hr_note_attachments 
  FOR SELECT 
  USING (auth.uid() IS NOT NULL);

-- RLS-Richtlinie für Einfügen
CREATE POLICY "Authentifizierte Benutzer können Anhänge hochladen" 
  ON public.employee_hr_note_attachments 
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL AND uploaded_by = auth.uid());

-- Testdaten einfügen (5 HR-Notizen für Mitarbeiter dddddddd-3333-4444-5555-cccccccccccc)
INSERT INTO public.employee_hr_notes (employee_id, author_id, title, content, category, tags, visibility, has_attachments, created_at) VALUES
('dddddddd-3333-4444-5555-cccccccccccc', 'cccccccc-2222-3333-4444-bbbbbbbbbbbb', 
 'Mitarbeitergespräch Q4 2025', 
 'Sehr konstruktives Gespräch über Karriereziele. Anna möchte in Richtung Lead-Position entwickeln. Nächste Schritte: Leadership Training und mehr Projektverantwortung. Sie zeigt große Motivation und hat bereits Interesse an der Team-Führung signalisiert.', 
 'performance_review', 
 ARRAY['Karriere', 'Entwicklung', 'Leadership'], 
 'hr_and_manager', 
 TRUE,
 '2025-10-25 14:30:00'),

('dddddddd-3333-4444-5555-cccccccccccc', 'cccccccc-2222-3333-4444-bbbbbbbbbbbb', 
 'Gehaltserhöhung besprochen', 
 'Gehaltsanpassung von 5.500€ auf 5.800€ ab 01.11.2025 vereinbart. Begründung: Überdurchschnittliche Performance und Übernahme zusätzlicher Verantwortung im letzten Quartal. Mitarbeiter sehr zufrieden mit der Entwicklung.', 
 'compensation', 
 ARRAY['Gehalt', 'Erhöhung'], 
 'hr_only', 
 TRUE,
 '2025-10-20 10:15:00'),

('dddddddd-3333-4444-5555-cccccccccccc', 'cccccccc-2222-3333-4444-bbbbbbbbbbbb', 
 'Feedback zu neuem Projekt', 
 'Anna hat das Digitalisierungsprojekt hervorragend geleitet. Team-Feedback durchweg positiv. Besonders hervorzuheben: Stakeholder-Management und technische Expertise. Das Projekt wurde 2 Wochen vor Deadline abgeschlossen.', 
 'project', 
 ARRAY['Projekt', 'Erfolg', 'Leadership'], 
 'hr_and_manager', 
 FALSE,
 '2025-10-15 16:45:00'),

('dddddddd-3333-4444-5555-cccccccccccc', 'cccccccc-2222-3333-4444-bbbbbbbbbbbb', 
 'Wunsch nach Remote-Arbeit', 
 'Anna hat angefragt, ob sie 3 Tage/Woche remote arbeiten kann. Nach Rücksprache mit Team: Genehmigt ab 01.12.2025. Hybrid-Regelung: Mo/Fr im Büro, Di-Do flexibel. Probezeit 3 Monate mit Evaluierung im Februar.', 
 'work_arrangement', 
 ARRAY['Remote', 'Flexibilität'], 
 'hr_and_manager', 
 FALSE,
 '2025-10-10 11:20:00'),

('dddddddd-3333-4444-5555-cccccccccccc', 'cccccccc-2222-3333-4444-bbbbbbbbbbbb', 
 'Onboarding-Gespräch', 
 'Erstes Check-in nach 14 Tagen. Anna hat sich sehr gut eingearbeitet. Team-Integration verläuft reibungslos. Buddy-System funktioniert gut. Keine besonderen Anliegen. Alle notwendigen Zugänge wurden eingerichtet.', 
 'onboarding', 
 ARRAY['Onboarding', 'Check-in'], 
 'hr_only', 
 FALSE,
 '2025-10-28 09:00:00');