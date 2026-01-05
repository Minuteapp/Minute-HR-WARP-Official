-- KORREKTUR: LEGACY-FIRMA SLUG SETZEN

-- Setze den korrekten Slug für die Legacy System Data Firma
UPDATE companies 
SET slug = 'legacy-system-data'
WHERE id = '00000000-0000-0000-0000-000000000001' 
AND name = 'Legacy System Data';