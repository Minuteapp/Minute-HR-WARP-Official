-- RPC-Funktion für Translation Memory Usage Count
CREATE OR REPLACE FUNCTION public.increment_translation_usage(
  p_tenant_id UUID,
  p_source_text TEXT,
  p_source_lang TEXT,
  p_target_lang TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.translation_memory
  SET 
    usage_count = usage_count + 1,
    updated_at = NOW()
  WHERE tenant_id = p_tenant_id
    AND source_text = p_source_text
    AND source_lang = p_source_lang
    AND target_lang = p_target_lang;
END;
$$;