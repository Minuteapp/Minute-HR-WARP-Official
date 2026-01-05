-- Erstelle Storage Bucket für Mitarbeiterdokumente falls nicht vorhanden
INSERT INTO storage.buckets (id, name, public) 
VALUES ('employee-documents', 'employee-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Erstelle Tabelle für Dokumenttypen falls nicht vorhanden
CREATE TABLE IF NOT EXISTS public.employee_document_types (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  category text NOT NULL CHECK (category IN ('contract', 'identification', 'certificate', 'training', 'other')),
  requires_expiry boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Erstelle Tabelle für Mitarbeiterdokumente falls nicht vorhanden  
CREATE TABLE IF NOT EXISTS public.employee_documents (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id uuid NOT NULL,
  document_type_id uuid REFERENCES public.employee_document_types(id),
  title text NOT NULL,
  description text,
  file_name text NOT NULL,
  file_path text NOT NULL,
  file_size bigint,
  mime_type text,
  document_number text,
  expiry_date date,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'pending', 'archived')),
  uploaded_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Trigger für updated_at
CREATE OR REPLACE FUNCTION public.update_employee_documents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_employee_documents_updated_at ON public.employee_documents;
CREATE TRIGGER update_employee_documents_updated_at
  BEFORE UPDATE ON public.employee_documents
  FOR EACH ROW EXECUTE FUNCTION public.update_employee_documents_updated_at();

-- Standard-Dokumenttypen einfügen
INSERT INTO public.employee_document_types (name, category, requires_expiry) VALUES
  ('Arbeitsvertrag', 'contract', false),
  ('Personalausweis', 'identification', true),
  ('Reisepass', 'identification', true),
  ('Führerschein', 'identification', true),
  ('Zertifikat', 'certificate', true),
  ('Schulungsnachweis', 'training', true),
  ('Sonstiges Dokument', 'other', false)
ON CONFLICT DO NOTHING;

-- RLS Policies für employee_documents
ALTER TABLE public.employee_documents ENABLE ROW LEVEL SECURITY;

-- Benutzer können ihre eigenen Dokumente sehen
CREATE POLICY "Users can view their own documents" ON public.employee_documents
  FOR SELECT USING (
    employee_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'hr', 'superadmin'))
  );

-- Benutzer können ihre eigenen Dokumente hochladen
CREATE POLICY "Users can upload their own documents" ON public.employee_documents
  FOR INSERT WITH CHECK (
    employee_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'hr', 'superadmin'))
  );

-- Benutzer können ihre eigenen Dokumente aktualisieren
CREATE POLICY "Users can update their own documents" ON public.employee_documents
  FOR UPDATE USING (
    employee_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'hr', 'superadmin'))
  );

-- Benutzer können ihre eigenen Dokumente löschen
CREATE POLICY "Users can delete their own documents" ON public.employee_documents
  FOR DELETE USING (
    employee_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'hr', 'superadmin'))
  );

-- RLS für employee_document_types (alle können lesen)
ALTER TABLE public.employee_document_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view document types" ON public.employee_document_types
  FOR SELECT USING (is_active = true);

-- Storage Policies für employee-documents bucket
CREATE POLICY "Users can view their own documents" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'employee-documents' AND 
    (auth.uid()::text = (storage.foldername(name))[1] OR 
     EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'hr', 'superadmin')))
  );

CREATE POLICY "Users can upload their own documents" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'employee-documents' AND 
    (auth.uid()::text = (storage.foldername(name))[1] OR 
     EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'hr', 'superadmin')))
  );

CREATE POLICY "Users can update their own documents" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'employee-documents' AND 
    (auth.uid()::text = (storage.foldername(name))[1] OR 
     EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'hr', 'superadmin')))
  );

CREATE POLICY "Users can delete their own documents" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'employee-documents' AND 
    (auth.uid()::text = (storage.foldername(name))[1] OR 
     EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'hr', 'superadmin')))
  );