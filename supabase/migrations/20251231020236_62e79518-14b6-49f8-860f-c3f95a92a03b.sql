-- Storage Bucket für Ausgabenbelege erstellen (falls nicht vorhanden)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'expense-documents',
  'expense-documents',
  true,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- RLS Policies für expense-documents bucket
CREATE POLICY "Authentifizierte Benutzer können eigene Belege hochladen"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'expense-documents' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Authentifizierte Benutzer können eigene Belege sehen"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'expense-documents' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Authentifizierte Benutzer können eigene Belege aktualisieren"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'expense-documents' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Authentifizierte Benutzer können eigene Belege löschen"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'expense-documents' AND (storage.foldername(name))[1] = auth.uid()::text);