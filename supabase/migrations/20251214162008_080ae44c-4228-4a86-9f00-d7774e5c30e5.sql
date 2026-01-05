-- Add missing columns to documents table
ALTER TABLE public.documents 
ADD COLUMN IF NOT EXISTS department TEXT,
ADD COLUMN IF NOT EXISTS version_number INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS is_current_version BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS visibility_level TEXT DEFAULT 'private';

-- Add index for department filtering
CREATE INDEX IF NOT EXISTS idx_documents_department ON public.documents(department);

-- Add index for version filtering
CREATE INDEX IF NOT EXISTS idx_documents_version ON public.documents(is_current_version);