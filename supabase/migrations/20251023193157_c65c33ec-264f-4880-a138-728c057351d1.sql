-- Fix search_path for update_updated_at_column function
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER SET search_path = public;

-- Recreate triggers
CREATE TRIGGER update_glossary_terms_updated_at BEFORE UPDATE ON public.glossary_terms
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_translation_memory_updated_at BEFORE UPDATE ON public.translation_memory
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();