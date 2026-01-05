-- Add missing columns for triggers
ALTER TABLE public.documents 
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id),
ADD COLUMN IF NOT EXISTS uploaded_by UUID REFERENCES auth.users(id);

-- Set uploaded_by to created_by where NULL
UPDATE public.documents SET uploaded_by = created_by WHERE uploaded_by IS NULL;

-- Index for company_id (multi-tenancy performance)
CREATE INDEX IF NOT EXISTS idx_documents_company_id ON public.documents(company_id);