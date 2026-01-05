-- Clean up duplicate chat commands, keep only the first one per command_key
DELETE FROM chat_commands
WHERE id NOT IN (
  SELECT DISTINCT ON (tenant_id, command_key) id
  FROM chat_commands
  ORDER BY tenant_id, command_key, created_at ASC
);