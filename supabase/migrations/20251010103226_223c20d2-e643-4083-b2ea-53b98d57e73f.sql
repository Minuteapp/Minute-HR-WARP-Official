-- Erstelle Storage Bucket für Abwesenheits-Dokumente
INSERT INTO storage.buckets (id, name, public) 
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

-- RLS Policies für den documents Bucket
CREATE POLICY "Benutzer können eigene Dokumente hochladen"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Benutzer können eigene Dokumente sehen"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Benutzer können eigene Dokumente löschen"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "HR/Admins können alle Dokumente sehen"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents' AND 
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'hr', 'superadmin')
  )
);

-- Update RLS Policy für absence_notifications
CREATE POLICY "System kann Benachrichtigungen erstellen"
ON absence_notifications FOR INSERT
TO authenticated
WITH CHECK (true);

-- Realtime für absence_notifications aktivieren
ALTER PUBLICATION supabase_realtime ADD TABLE absence_notifications;
ALTER TABLE absence_notifications REPLICA IDENTITY FULL;