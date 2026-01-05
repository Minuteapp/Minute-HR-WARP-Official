-- =====================================================
-- NUR FUNKTIONEN MIT search_path ABSICHERN (Teil 1)
-- =====================================================

-- Funktion: handle_new_user_role
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role text;
  v_company_id uuid;
BEGIN
  IF new.raw_user_meta_data->>'role' IS NOT NULL THEN
    v_role := new.raw_user_meta_data->>'role';
  ELSE
    v_role := 'employee';
  END IF;

  BEGIN
    IF new.raw_user_meta_data->>'company_id' IS NOT NULL AND 
       new.raw_user_meta_data->>'company_id' != 'null' AND 
       new.raw_user_meta_data->>'company_id' != '' THEN
      v_company_id := (new.raw_user_meta_data->>'company_id')::uuid;
    ELSE
      v_company_id := NULL;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    v_company_id := NULL;
  END;
  
  INSERT INTO public.user_roles (user_id, role, company_id)
  VALUES (NEW.id, v_role::user_role, v_company_id);
  
  RETURN NEW;
END;
$$;

-- Funktion: update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Funktion: handle_new_chat
CREATE OR REPLACE FUNCTION public.handle_new_chat()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.channel_members (channel_id, user_id, role)
  VALUES (NEW.id, NEW.created_by, 'owner');
  RETURN NEW;
END;
$$;

-- Funktion: handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;

-- Funktion: generate_document_number
CREATE OR REPLACE FUNCTION public.generate_document_number()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.document_number IS NULL THEN
    NEW.document_number := 'DOC-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(nextval('document_number_seq')::text, 6, '0');
  END IF;
  RETURN NEW;
END;
$$;

-- Funktion: validate_document_type
CREATE OR REPLACE FUNCTION public.validate_document_type()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.document_type NOT IN ('contract', 'certificate', 'identification', 'other') THEN
    NEW.document_type := 'other';
  END IF;
  RETURN NEW;
END;
$$;

-- Funktion: generate_ticket_number
CREATE OR REPLACE FUNCTION public.generate_ticket_number()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.ticket_number IS NULL THEN
    NEW.ticket_number := 'TKT-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(nextval('ticket_number_seq')::text, 6, '0');
  END IF;
  RETURN NEW;
END;
$$;