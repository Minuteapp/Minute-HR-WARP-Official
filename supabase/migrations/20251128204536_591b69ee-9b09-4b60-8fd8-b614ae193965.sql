-- Phase 1: Add parent_message_id column for thread/reply functionality
ALTER TABLE messages ADD COLUMN parent_message_id UUID REFERENCES messages(id) ON DELETE CASCADE;

-- Create index for better query performance
CREATE INDEX idx_messages_parent ON messages(parent_message_id);

-- Add comment for documentation
COMMENT ON COLUMN messages.parent_message_id IS 'Reference to parent message for threads/replies';