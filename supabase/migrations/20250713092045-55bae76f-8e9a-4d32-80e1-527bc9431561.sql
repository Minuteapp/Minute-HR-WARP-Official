-- Firmenspezifische Branding-Einstellungen hinzufügen
ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS primary_color TEXT DEFAULT '#3B82F6',
ADD COLUMN IF NOT EXISTS secondary_color TEXT DEFAULT '#1E40AF',
ADD COLUMN IF NOT EXISTS brand_font TEXT DEFAULT 'Inter';

-- Update für Hiprocall mit spezifischen Branding-Einstellungen
UPDATE companies 
SET 
  logo_url = '/lovable-uploads/b88ebfb8-a13b-4a0e-a900-416c4eaa513c.png',
  primary_color = '#0066CC',
  secondary_color = '#004499'
WHERE id = '51b32028-fb21-4e94-a9c2-794c3d0a07c8';