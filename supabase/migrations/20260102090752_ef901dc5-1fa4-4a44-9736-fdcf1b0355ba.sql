-- Fix: profiles.metadata Spalte hinzufügen (wurde im Frontend referenziert aber fehlt)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;