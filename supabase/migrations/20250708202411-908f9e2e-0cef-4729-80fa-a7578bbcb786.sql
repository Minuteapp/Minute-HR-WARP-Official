-- Enable RLS on tables that don't have it yet (safe approach)
-- First, let's enable RLS on tables that need it

-- Calendar Event Templates
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables t
    JOIN pg_class c ON c.relname = t.tablename
    WHERE t.schemaname = 'public' 
    AND t.tablename = 'calendar_event_templates'
    AND c.relrowsecurity = true
  ) THEN
    ALTER TABLE public.calendar_event_templates ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Calendar Invitations
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables t
    JOIN pg_class c ON c.relname = t.tablename
    WHERE t.schemaname = 'public' 
    AND t.tablename = 'calendar_invitations'
    AND c.relrowsecurity = true
  ) THEN
    ALTER TABLE public.calendar_invitations ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Calendar Reminders
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables t
    JOIN pg_class c ON c.relname = t.tablename
    WHERE t.schemaname = 'public' 
    AND t.tablename = 'calendar_reminders'
    AND c.relrowsecurity = true
  ) THEN
    ALTER TABLE public.calendar_reminders ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Channel Members
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables t
    JOIN pg_class c ON c.relname = t.tablename
    WHERE t.schemaname = 'public' 
    AND t.tablename = 'channel_members'
    AND c.relrowsecurity = true
  ) THEN
    ALTER TABLE public.channel_members ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;