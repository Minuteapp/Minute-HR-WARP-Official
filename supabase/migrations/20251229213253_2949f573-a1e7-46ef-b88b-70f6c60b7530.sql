-- Security Fix: search_path für log_absence_changes setzen
CREATE OR REPLACE FUNCTION public.log_absence_changes()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.absence_audit_trail (
    absence_request_id, 
    action, 
    performed_by, 
    old_values, 
    new_values,
    ip_address,
    company_id
  ) VALUES (
    COALESCE(NEW.id, OLD.id),
    CASE 
      WHEN TG_OP = 'INSERT' THEN 'created'
      WHEN TG_OP = 'UPDATE' THEN 'updated'
      WHEN TG_OP = 'DELETE' THEN 'cancelled'
    END,
    auth.uid(),
    CASE WHEN TG_OP = 'DELETE' OR TG_OP = 'UPDATE' THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN to_jsonb(NEW) ELSE NULL END,
    inet_client_addr(),
    COALESCE(NEW.company_id, OLD.company_id)
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;