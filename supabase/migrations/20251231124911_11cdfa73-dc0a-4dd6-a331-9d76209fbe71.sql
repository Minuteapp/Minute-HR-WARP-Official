-- Create task-attachments storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'task-attachments', 
  'task-attachments', 
  true,
  10485760, -- 10MB limit
  ARRAY['image/png', 'image/jpeg', 'image/gif', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
)
ON CONFLICT (id) DO NOTHING;

-- RLS Policies for task-attachments bucket
CREATE POLICY "Authenticated users can view task attachments"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'task-attachments' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can upload task attachments"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'task-attachments' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can delete own task attachments"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'task-attachments' 
  AND auth.role() = 'authenticated'
);

-- Create task_attachments table if not exists
CREATE TABLE IF NOT EXISTS public.task_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER NOT NULL DEFAULT 0,
  file_type TEXT,
  file_url TEXT,
  uploaded_by UUID REFERENCES auth.users(id),
  uploaded_by_name TEXT,
  company_id UUID NOT NULL REFERENCES public.companies(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.task_attachments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view task attachments in their company"
ON public.task_attachments FOR SELECT
USING (
  company_id IN (
    SELECT company_id FROM public.employees WHERE user_id = auth.uid()
    UNION
    SELECT company_id FROM public.profiles WHERE id = auth.uid()
  )
);

CREATE POLICY "Users can create task attachments in their company"
ON public.task_attachments FOR INSERT
WITH CHECK (
  company_id IN (
    SELECT company_id FROM public.employees WHERE user_id = auth.uid()
    UNION
    SELECT company_id FROM public.profiles WHERE id = auth.uid()
  )
);

CREATE POLICY "Users can delete task attachments in their company"
ON public.task_attachments FOR DELETE
USING (
  company_id IN (
    SELECT company_id FROM public.employees WHERE user_id = auth.uid()
    UNION
    SELECT company_id FROM public.profiles WHERE id = auth.uid()
  )
);