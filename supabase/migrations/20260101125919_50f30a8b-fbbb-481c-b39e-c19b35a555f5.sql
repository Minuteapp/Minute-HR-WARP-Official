-- Deaktiviere alle aktiven Preview-Sessions
UPDATE user_role_preview_sessions 
SET is_preview_active = false
WHERE is_preview_active = true;