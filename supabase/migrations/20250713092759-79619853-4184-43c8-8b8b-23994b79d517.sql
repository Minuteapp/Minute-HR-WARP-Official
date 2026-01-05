-- Slug-Spalte für Multi-Tenant URLs hinzufügen
ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

-- Slugs für existierende Firmen erstellen
UPDATE companies 
SET slug = LOWER(REPLACE(REPLACE(name, ' ', '-'), 'ä', 'ae'))
WHERE slug IS NULL;

-- Spezielle Slug für Hiprocall setzen
UPDATE companies 
SET slug = 'hiprocall'
WHERE id = '51b32028-fb21-4e94-a9c2-794c3d0a07c8';

-- Index für bessere Performance
CREATE INDEX IF NOT EXISTS idx_companies_slug ON companies(slug);
CREATE INDEX IF NOT EXISTS idx_companies_active_slug ON companies(slug, is_active);