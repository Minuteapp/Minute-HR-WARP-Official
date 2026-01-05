-- Umfassendes Dokumente-Modul für HR-App "Minute"

-- Enum für Dokumentenstatus
CREATE TYPE document_status AS ENUM ('draft', 'approved', 'expired', 'archived');

-- Enum für Dokumententypen/Kategorien
CREATE TYPE document_category AS ENUM (
  'contract', 'certificate', 'training', 'identification', 'policy', 
  'payroll', 'visa', 'permit', 'onboarding', 'compliance', 'template', 'other'
);

-- Enum für Dateitypen
CREATE TYPE file_type AS ENUM ('pdf', 'docx', 'xlsx', 'png', 'jpg', 'jpeg', 'doc', 'xls', 'txt');

-- Haupttabelle für Dokumente
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category document_category NOT NULL DEFAULT 'other',
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type file_type NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type TEXT NOT NULL,
  
  -- Versionierung
  version_number INTEGER NOT NULL DEFAULT 1,
  parent_document_id UUID REFERENCES public.documents(id),
  is_current_version BOOLEAN NOT NULL DEFAULT true,
  
  -- Status und Lifecycle
  status document_status NOT NULL DEFAULT 'draft',
  expiry_date DATE,
  reminder_days_before INTEGER DEFAULT 30,
  
  -- Metadaten
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  ocr_content TEXT, -- Für Volltextsuche
  ai_extracted_data JSONB DEFAULT '{}',
  
  -- Berechtigungen
  visibility_level TEXT DEFAULT 'private', -- private, team, department, company
  allowed_roles TEXT[] DEFAULT '{}',
  allowed_users UUID[] DEFAULT '{}',
  
  -- Audit
  created_by UUID NOT NULL DEFAULT auth.uid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID DEFAULT auth.uid(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  uploaded_by UUID DEFAULT auth.uid(),
  
  -- Company Isolation
  company_id UUID,
  
  -- E-Signatur
  requires_signature BOOLEAN DEFAULT false,
  signature_status TEXT DEFAULT 'pending', -- pending, signed, declined
  signed_by UUID,
  signed_at TIMESTAMPTZ,
  signature_data JSONB DEFAULT '{}',
  
  -- Template Daten
  is_template BOOLEAN DEFAULT false,
  template_data JSONB DEFAULT '{}',
  
  -- Integration
  linked_module TEXT, -- onboarding, payroll, compliance, etc.
  linked_record_id UUID,
  
  -- Performance
  search_vector tsvector GENERATED ALWAYS AS (
    to_tsvector('german', COALESCE(title, '') || ' ' || COALESCE(description, '') || ' ' || COALESCE(ocr_content, ''))
  ) STORED
);

-- Dokumenten-Freigabelinks
CREATE TABLE public.document_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  share_token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'base64'),
  created_by UUID NOT NULL DEFAULT auth.uid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  max_downloads INTEGER DEFAULT 1,
  download_count INTEGER DEFAULT 0,
  password_hash TEXT,
  is_active BOOLEAN DEFAULT true,
  access_log JSONB DEFAULT '[]',
  company_id UUID
);

-- Download-Log
CREATE TABLE public.document_downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL DEFAULT auth.uid(),
  downloaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT,
  download_method TEXT DEFAULT 'direct', -- direct, share_link
  share_token TEXT,
  company_id UUID
);

-- Dokumenten-Kommentare/Reviews
CREATE TABLE public.document_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL DEFAULT auth.uid(),
  comment TEXT NOT NULL,
  comment_type TEXT DEFAULT 'comment', -- comment, approval, rejection
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  parent_comment_id UUID REFERENCES public.document_comments(id),
  is_resolved BOOLEAN DEFAULT false,
  company_id UUID
);

-- Dokumenten-Erinnerungen
CREATE TABLE public.document_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  reminder_type TEXT NOT NULL, -- expiry, renewal, review
  reminder_date DATE NOT NULL,
  notification_sent BOOLEAN DEFAULT false,
  created_by UUID NOT NULL DEFAULT auth.uid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB DEFAULT '{}',
  company_id UUID
);

-- KI-Verarbeitungsqueue
CREATE TABLE public.document_ai_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  task_type TEXT NOT NULL, -- ocr, categorization, expiry_extraction
  status TEXT NOT NULL DEFAULT 'pending', -- pending, processing, completed, failed
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  result JSONB DEFAULT '{}',
  error_message TEXT,
  company_id UUID
);

-- Dokumenten-Vorlagen
CREATE TABLE public.document_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category document_category NOT NULL,
  template_file_path TEXT NOT NULL,
  variables JSONB DEFAULT '{}', -- Platzhalter für Variablen
  is_active BOOLEAN DEFAULT true,
  created_by UUID NOT NULL DEFAULT auth.uid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  usage_count INTEGER DEFAULT 0,
  company_id UUID
);

-- Massen-Upload Sessions
CREATE TABLE public.bulk_upload_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_name TEXT NOT NULL,
  created_by UUID NOT NULL DEFAULT auth.uid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  total_files INTEGER DEFAULT 0,
  processed_files INTEGER DEFAULT 0,
  failed_files INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending', -- pending, processing, completed, failed
  error_log JSONB DEFAULT '[]',
  company_id UUID
);

-- Indizes für Performance
CREATE INDEX IF NOT EXISTS idx_documents_company_id ON public.documents(company_id);
CREATE INDEX IF NOT EXISTS idx_documents_category ON public.documents(category);
CREATE INDEX IF NOT EXISTS idx_documents_status ON public.documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_expiry_date ON public.documents(expiry_date);
CREATE INDEX IF NOT EXISTS idx_documents_created_by ON public.documents(created_by);
CREATE INDEX IF NOT EXISTS idx_documents_search_vector ON public.documents USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_documents_tags ON public.documents USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_documents_parent ON public.documents(parent_document_id);
CREATE INDEX IF NOT EXISTS idx_documents_current_version ON public.documents(is_current_version);

-- Trigger für Updated At
CREATE OR REPLACE FUNCTION update_documents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  NEW.updated_by = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON public.documents
  FOR EACH ROW
  EXECUTE FUNCTION update_documents_updated_at();

-- Auto-Assign Company ID Trigger
CREATE TRIGGER auto_assign_company_documents
  BEFORE INSERT ON public.documents
  FOR EACH ROW
  EXECUTE FUNCTION auto_assign_company_id();

CREATE TRIGGER auto_assign_company_document_shares
  BEFORE INSERT ON public.document_shares
  FOR EACH ROW
  EXECUTE FUNCTION auto_assign_company_id();

CREATE TRIGGER auto_assign_company_document_downloads
  BEFORE INSERT ON public.document_downloads
  FOR EACH ROW
  EXECUTE FUNCTION auto_assign_company_id();

CREATE TRIGGER auto_assign_company_document_comments
  BEFORE INSERT ON public.document_comments
  FOR EACH ROW
  EXECUTE FUNCTION auto_assign_company_id();

CREATE TRIGGER auto_assign_company_document_reminders
  BEFORE INSERT ON public.document_reminders
  FOR EACH ROW
  EXECUTE FUNCTION auto_assign_company_id();

CREATE TRIGGER auto_assign_company_document_ai_queue
  BEFORE INSERT ON public.document_ai_queue
  FOR EACH ROW
  EXECUTE FUNCTION auto_assign_company_id();

CREATE TRIGGER auto_assign_company_document_templates
  BEFORE INSERT ON public.document_templates
  FOR EACH ROW
  EXECUTE FUNCTION auto_assign_company_id();

CREATE TRIGGER auto_assign_company_bulk_upload_sessions
  BEFORE INSERT ON public.bulk_upload_sessions
  FOR EACH ROW
  EXECUTE FUNCTION auto_assign_company_id();

-- RLS Policies für Company Isolation

-- Documents Policies
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Document Company Isolation" ON public.documents
FOR ALL USING (
  CASE 
    WHEN is_in_tenant_context() THEN 
      company_id = get_tenant_company_id_safe()
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN 
      true
    ELSE 
      company_id = get_user_company_id(auth.uid()) OR company_id IS NULL
  END
);

-- Document Shares Policies
ALTER TABLE public.document_shares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Document Shares Company Isolation" ON public.document_shares
FOR ALL USING (
  CASE 
    WHEN is_in_tenant_context() THEN 
      company_id = get_tenant_company_id_safe()
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN 
      true
    ELSE 
      company_id = get_user_company_id(auth.uid()) OR company_id IS NULL
  END
);

-- Document Downloads Policies
ALTER TABLE public.document_downloads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Document Downloads Company Isolation" ON public.document_downloads
FOR ALL USING (
  CASE 
    WHEN is_in_tenant_context() THEN 
      company_id = get_tenant_company_id_safe()
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN 
      true
    ELSE 
      company_id = get_user_company_id(auth.uid()) OR company_id IS NULL
  END
);

-- Document Comments Policies
ALTER TABLE public.document_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Document Comments Company Isolation" ON public.document_comments
FOR ALL USING (
  CASE 
    WHEN is_in_tenant_context() THEN 
      company_id = get_tenant_company_id_safe()
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN 
      true
    ELSE 
      company_id = get_user_company_id(auth.uid()) OR company_id IS NULL
  END
);

-- Weitere Policies für alle anderen Tabellen
ALTER TABLE public.document_reminders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Document Reminders Company Isolation" ON public.document_reminders
FOR ALL USING (
  CASE 
    WHEN is_in_tenant_context() THEN 
      company_id = get_tenant_company_id_safe()
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN 
      true
    ELSE 
      company_id = get_user_company_id(auth.uid()) OR company_id IS NULL
  END
);

ALTER TABLE public.document_ai_queue ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Document AI Queue Company Isolation" ON public.document_ai_queue
FOR ALL USING (
  CASE 
    WHEN is_in_tenant_context() THEN 
      company_id = get_tenant_company_id_safe()
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN 
      true
    ELSE 
      company_id = get_user_company_id(auth.uid()) OR company_id IS NULL
  END
);

ALTER TABLE public.document_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Document Templates Company Isolation" ON public.document_templates
FOR ALL USING (
  CASE 
    WHEN is_in_tenant_context() THEN 
      company_id = get_tenant_company_id_safe()
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN 
      true
    ELSE 
      company_id = get_user_company_id(auth.uid()) OR company_id IS NULL
  END
);

ALTER TABLE public.bulk_upload_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Bulk Upload Sessions Company Isolation" ON public.bulk_upload_sessions
FOR ALL USING (
  CASE 
    WHEN is_in_tenant_context() THEN 
      company_id = get_tenant_company_id_safe()
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN 
      true
    ELSE 
      company_id = get_user_company_id(auth.uid()) OR company_id IS NULL
  END
);

-- Storage Bucket für Dokumente erstellen
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents', 
  'documents', 
  false, 
  52428800, -- 50MB Limit
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'image/png', 'image/jpeg', 'text/plain']
)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
CREATE POLICY "Document Upload Access" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'documents' AND
  auth.uid() IS NOT NULL
);

CREATE POLICY "Document View Access" ON storage.objects
FOR SELECT USING (
  bucket_id = 'documents' AND
  auth.uid() IS NOT NULL
);

CREATE POLICY "Document Update Access" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'documents' AND
  auth.uid() IS NOT NULL
);

CREATE POLICY "Document Delete Access" ON storage.objects
FOR DELETE USING (
  bucket_id = 'documents' AND
  (
    auth.uid()::text = (storage.foldername(name))[1] OR
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'superadmin', 'hr')
    )
  )
);