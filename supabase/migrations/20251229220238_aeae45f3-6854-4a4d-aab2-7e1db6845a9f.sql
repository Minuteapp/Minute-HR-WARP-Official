-- Beende alle aktiven Sessions für den Superadmin
UPDATE impersonation_sessions 
SET status = 'ended', ended_at = now() 
WHERE status = 'active' 
AND superadmin_id = 'e7219c39-dbe0-45f3-a6b8-cbbf20517bb2';

-- Beende auch in active_tenant_sessions falls vorhanden
UPDATE active_tenant_sessions
SET is_active = false
WHERE session_user_id = 'e7219c39-dbe0-45f3-a6b8-cbbf20517bb2'
AND is_active = true;