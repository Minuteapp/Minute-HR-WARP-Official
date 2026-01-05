-- Employee Document Management System
-- Erweitere die documents Tabelle für Employee-spezifische Dokumente

-- Dokumenttypen für Mitarbeiter
CREATE TABLE public.employee_document_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- 'contract', 'certificate', 'identification', 'training', 'other'
  is_required BOOLEAN DEFAULT false,
  requires_expiry BOOLEAN DEFAULT false,
  template_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Mitarbeiterdokumente
CREATE TABLE public.employee_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL,
  document_type_id UUID REFERENCES public.employee_document_types(id),
  title TEXT NOT NULL,
  description TEXT,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type TEXT NOT NULL,
  document_number TEXT,
  issue_date DATE,
  expiry_date DATE,
  issued_by TEXT,
  status TEXT DEFAULT 'active', -- 'active', 'expired', 'archived', 'pending'
  is_confidential BOOLEAN DEFAULT false,
  uploaded_by UUID,
  version INTEGER DEFAULT 1,
  parent_document_id UUID REFERENCES public.employee_documents(id),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Dokumenten-Reminder für ablaufende Dokumente
CREATE TABLE public.document_reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_document_id UUID REFERENCES public.employee_documents(id) ON DELETE CASCADE,
  reminder_type TEXT NOT NULL, -- 'expiry_warning', 'renewal_required', 'custom'
  days_before_expiry INTEGER NOT NULL,
  notification_sent BOOLEAN DEFAULT false,
  notification_date TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Dokumenten-Zugriffskontrolle
CREATE TABLE public.document_access_permissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_document_id UUID REFERENCES public.employee_documents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  permission_type TEXT NOT NULL, -- 'view', 'edit', 'delete', 'download'
  granted_by UUID,
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true
);

-- Enable RLS
ALTER TABLE public.employee_document_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_access_permissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies für employee_document_types
CREATE POLICY "Everyone can view document types" 
ON public.employee_document_types 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage document types" 
ON public.employee_document_types 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = auth.uid() 
  AND role IN ('admin', 'hr', 'superadmin')
));

-- RLS Policies für employee_documents
CREATE POLICY "Users can view their own documents" 
ON public.employee_documents 
FOR SELECT 
USING (
  employee_id = auth.uid() 
  OR EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'hr', 'superadmin')
  )
  OR EXISTS (
    SELECT 1 FROM public.document_access_permissions dap 
    WHERE dap.employee_document_id = employee_documents.id 
    AND dap.user_id = auth.uid() 
    AND dap.permission_type = 'view'
    AND dap.is_active = true
    AND (dap.expires_at IS NULL OR dap.expires_at > now())
  )
);

CREATE POLICY "HR and Admins can manage employee documents" 
ON public.employee_documents 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = auth.uid() 
  AND role IN ('admin', 'hr', 'superadmin')
));

CREATE POLICY "Users can upload their own documents" 
ON public.employee_documents 
FOR INSERT 
WITH CHECK (employee_id = auth.uid() OR uploaded_by = auth.uid());

-- RLS Policies für document_reminders
CREATE POLICY "HR and Admins can manage reminders" 
ON public.document_reminders 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = auth.uid() 
  AND role IN ('admin', 'hr', 'superadmin')
));

-- RLS Policies für document_access_permissions
CREATE POLICY "Admins can manage access permissions" 
ON public.document_access_permissions 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = auth.uid() 
  AND role IN ('admin', 'hr', 'superadmin')
));

-- Triggers für updated_at
CREATE TRIGGER update_employee_document_types_updated_at
  BEFORE UPDATE ON public.employee_document_types
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_employee_documents_updated_at
  BEFORE UPDATE ON public.employee_documents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Funktion für automatische Reminder-Erstellung
CREATE OR REPLACE FUNCTION public.create_document_reminders()
RETURNS TRIGGER AS $$
BEGIN
  -- Erstelle Standard-Reminder für Dokumente mit Ablaufdatum
  IF NEW.expiry_date IS NOT NULL THEN
    -- 30 Tage vor Ablauf
    INSERT INTO public.document_reminders (
      employee_document_id, 
      reminder_type, 
      days_before_expiry
    ) VALUES (
      NEW.id, 
      'expiry_warning', 
      30
    );
    
    -- 7 Tage vor Ablauf
    INSERT INTO public.document_reminders (
      employee_document_id, 
      reminder_type, 
      days_before_expiry
    ) VALUES (
      NEW.id, 
      'expiry_warning', 
      7
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER create_document_reminders_trigger
  AFTER INSERT ON public.employee_documents
  FOR EACH ROW
  EXECUTE FUNCTION public.create_document_reminders();

-- Standard-Dokumenttypen einfügen
INSERT INTO public.employee_document_types (name, description, category, is_required, requires_expiry) VALUES
('Arbeitsvertrag', 'Haupt-Arbeitsvertrag des Mitarbeiters', 'contract', true, false),
('Personalausweis', 'Kopie des Personalausweises', 'identification', true, true),
('Reisepass', 'Kopie des Reisepasses', 'identification', false, true),
('Führungszeugnis', 'Polizeiliches Führungszeugnis', 'certificate', false, true),
('Gesundheitszeugnis', 'Arbeitsmedizinische Untersuchung', 'certificate', false, true),
('Zeugnisse', 'Bildungsabschlüsse und Zertifikate', 'certificate', false, false),
('Fortbildungszertifikat', 'Berufliche Weiterbildungen', 'training', false, true),
('Führerschein', 'Kopie des Führerscheins', 'identification', false, true),
('Sozialversicherungsausweis', 'Kopie des Sozialversicherungsausweises', 'identification', false, false),
('Steuerliche Bescheinigungen', 'Lohnsteuerkarte, Freibeträge etc.', 'other', false, true);

-- Storage Bucket für Employee Documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'employee-documents', 
  'employee-documents', 
  false,
  52428800, -- 50MB limit
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
);

-- Storage RLS Policies
CREATE POLICY "Employees can upload their own documents"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'employee-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view documents they have access to"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'employee-documents' 
  AND (
    auth.uid()::text = (storage.foldername(name))[1]
    OR EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'hr', 'superadmin')
    )
  )
);

CREATE POLICY "HR and Admins can manage all employee documents"
ON storage.objects
FOR ALL
USING (
  bucket_id = 'employee-documents' 
  AND EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'hr', 'superadmin')
  )
);