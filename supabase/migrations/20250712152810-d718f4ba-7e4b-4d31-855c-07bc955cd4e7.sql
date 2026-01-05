-- Erstelle Storage Bucket für Firmen-Logos
INSERT INTO storage.buckets (id, name, public) VALUES ('company-logos', 'company-logos', true);

-- Storage Policies für Firmen-Logos
CREATE POLICY "Company logos are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'company-logos');

CREATE POLICY "Admins can upload company logos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'company-logos' AND 
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin')
  )
);

CREATE POLICY "Admins can update company logos" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'company-logos' AND 
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin')
  )
);

CREATE POLICY "Admins can delete company logos" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'company-logos' AND 
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin')
  )
);