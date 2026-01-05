-- 1. Überprüfe welche Firma "test-ug" sein sollte und erstelle sie falls nötig
INSERT INTO public.companies (
    name,
    slug,
    subscription_status,
    is_active,
    employee_count,
    created_at,
    primary_color,
    secondary_color,
    brand_font
) VALUES (
    'Test UG',
    'test-ug',
    'free',
    true,
    0,
    now(),
    '#3B82F6',
    '#1E40AF',
    'Inter'
) ON CONFLICT (slug) DO NOTHING;

-- 2. Storage RLS für Objects reparieren - ermögliche Uploads
DROP POLICY IF EXISTS "Allow authenticated users to upload files" ON storage.objects;
CREATE POLICY "Allow authenticated users to upload files" 
ON storage.objects FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow authenticated users to view files" ON storage.objects;
CREATE POLICY "Allow authenticated users to view files" 
ON storage.objects FOR SELECT 
USING (auth.role() = 'authenticated' OR bucket_id = 'public');

DROP POLICY IF EXISTS "Allow authenticated users to update files" ON storage.objects;
CREATE POLICY "Allow authenticated users to update files" 
ON storage.objects FOR UPDATE 
USING (auth.role() = 'authenticated');

-- 3. Stelle sicher dass ein minute-logo Bucket existiert
INSERT INTO storage.buckets (id, name, public) 
VALUES ('minute-logo', 'minute-logo', true) 
ON CONFLICT (id) DO NOTHING;