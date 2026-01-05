
-- Erstellen einer Tabelle für Kalender-Dokumentenreferenzen
CREATE TABLE IF NOT EXISTS public.calendar_document_references (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.calendar_events(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  document_type TEXT NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  contains_personal_data BOOLEAN DEFAULT FALSE
);

-- Erstellen eines Index für schnellere Suche
CREATE INDEX IF NOT EXISTS calendar_documents_event_id_idx ON public.calendar_document_references(event_id);

-- Row-Level Security aktivieren
ALTER TABLE public.calendar_document_references ENABLE ROW LEVEL SECURITY;

-- RLS-Richtlinie für Lesen
CREATE POLICY "Users can read their own documents" 
  ON public.calendar_document_references 
  FOR SELECT 
  USING (
    event_id IN (
      SELECT id FROM public.calendar_events 
      WHERE created_by = auth.uid() 
         OR auth.uid() = ANY(SELECT jsonb_array_elements_text(attendees)::uuid)
    )
  );

-- RLS-Richtlinie für Einfügen
CREATE POLICY "Users can insert documents for their own events" 
  ON public.calendar_document_references 
  FOR INSERT 
  WITH CHECK (
    event_id IN (
      SELECT id FROM public.calendar_events 
      WHERE created_by = auth.uid()
    )
  );

-- RLS-Richtlinie für Löschen
CREATE POLICY "Users can delete their own documents" 
  ON public.calendar_document_references 
  FOR DELETE 
  USING (
    event_id IN (
      SELECT id FROM public.calendar_events 
      WHERE created_by = auth.uid()
    )
  );
