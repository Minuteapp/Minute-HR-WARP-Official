-- Create storage bucket for sick leave documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('sick-leave-documents', 'sick-leave-documents', false)
ON CONFLICT (id) DO NOTHING;

-- RLS Policy: Employees can view their own sick leave documents
CREATE POLICY "Employees can view their own sick leave documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'sick-leave-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- RLS Policy: Employees can upload their own documents
CREATE POLICY "Employees can upload their own sick leave documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'sick-leave-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- RLS Policy: Employees can delete their own documents
CREATE POLICY "Employees can delete their own sick leave documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'sick-leave-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);