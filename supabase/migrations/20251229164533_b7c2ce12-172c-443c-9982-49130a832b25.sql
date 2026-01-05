-- Security Fix: Set search_path for functions
ALTER FUNCTION update_event_system_updated_at() SET search_path = public;
ALTER FUNCTION auto_create_outbox_entry() SET search_path = public;