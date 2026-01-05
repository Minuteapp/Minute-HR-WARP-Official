-- Erstelle die fehlende user_role für Daniel Häuslein (ohne ON CONFLICT)
INSERT INTO user_roles (user_id, role, company_id)
VALUES (
  '046aa705-5009-4387-b148-6646d569b9a2', -- Daniel Häuslein user_id
  'admin', 
  '51b32028-fb21-4e94-a9c2-794c3d0a07c8'  -- Hiprocall GmbH company_id
);