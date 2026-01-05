-- 1. Abgelaufene Sessions deaktivieren
UPDATE active_tenant_sessions 
SET is_active = false 
WHERE expires_at < now() AND is_active = true;

-- 2. Superadmin einer Company zuweisen (falls noch keine company_id vorhanden)
UPDATE user_roles 
SET company_id = 'a581a8b5-3b4d-4ed9-a565-103cd5cdbd44'
WHERE user_id = 'e7219c39-dbe0-45f3-a6b8-cbbf20517bb2'
  AND company_id IS NULL;