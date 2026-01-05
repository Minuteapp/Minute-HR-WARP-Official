-- Duplikate in chat_commands entfernen, behalte nur den neuesten Eintrag pro command_key und tenant_id
DELETE FROM chat_commands
WHERE id NOT IN (
  SELECT DISTINCT ON (tenant_id, command_key) id
  FROM chat_commands
  ORDER BY tenant_id, command_key, created_at DESC
);

-- Unique constraint hinzufügen um zukünftige Duplikate zu verhindern
ALTER TABLE chat_commands 
ADD CONSTRAINT chat_commands_tenant_command_unique 
UNIQUE (tenant_id, command_key);

-- PostgREST Schema-Cache neu laden
NOTIFY pgrst, 'reload schema';