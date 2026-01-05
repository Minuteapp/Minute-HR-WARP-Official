-- Update der HPC GmbH mit einem korrekten Slug
UPDATE companies 
SET slug = 'hpc-gmbh' 
WHERE name = 'HPC GmbH' AND slug IS NULL;

-- Update aller anderen Firmen ohne Slug
UPDATE companies 
SET slug = CASE 
  WHEN name = 'Hiprocall GmbH' THEN 'hiprocall-gmbh-alt'
  WHEN name = 'Test UG' AND slug IS NULL THEN 'test-ug-' || substr(id::text, 1, 8)
  ELSE lower(regexp_replace(name, '[^a-zA-Z0-9]+', '-', 'g'))
END
WHERE slug IS NULL AND name != 'Legacy System Data';