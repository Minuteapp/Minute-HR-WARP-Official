-- Slug-Spalte hinzufügen ohne UNIQUE constraint zuerst
ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS slug TEXT;

-- Duplikate vermeiden durch numerische Suffixe
UPDATE companies 
SET slug = CASE 
  WHEN id = '51b32028-fb21-4e94-a9c2-794c3d0a07c8' THEN 'hiprocall'
  ELSE LOWER(REPLACE(REPLACE(name, ' ', '-'), 'ä', 'ae')) || '-' || substring(id::text, 1, 8)
END
WHERE slug IS NULL;

-- Unique constraint hinzufügen
ALTER TABLE companies 
ADD CONSTRAINT companies_slug_unique UNIQUE (slug);

-- Index für bessere Performance
CREATE INDEX IF NOT EXISTS idx_companies_slug ON companies(slug);
CREATE INDEX IF NOT EXISTS idx_companies_active_slug ON companies(slug, is_active);