-- Setze den fehlenden Slug für HPC2 GmbH
UPDATE companies 
SET slug = 'hpc2-gmbh'
WHERE name = 'HPC2 GmbH' AND slug IS NULL;