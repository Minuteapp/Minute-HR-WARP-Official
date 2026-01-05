-- Erstelle die Funktion zum direkten Erstellen eines Admin-Benutzers mit Passwort
CREATE OR REPLACE FUNCTION public.create_admin_user_with_password(
  p_email TEXT,
  p_password TEXT,
  p_company_id UUID,
  p_full_name TEXT,
  p_phone TEXT DEFAULT NULL,
  p_position TEXT DEFAULT NULL,
  p_salutation TEXT DEFAULT 'Herr'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id UUID;
  v_result JSON;
BEGIN
  -- Prüfe ob Benutzer bereits existiert
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = p_email) THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Ein Benutzer mit dieser E-Mail-Adresse ist bereits registriert.'
    );
  END IF;

  -- Erstelle neuen Benutzer in auth.users
  INSERT INTO auth.users (
    id,
    email,
    email_confirmed_at,
    encrypted_password,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    gen_random_uuid(),
    p_email,
    now(),
    crypt(p_password, gen_salt('bf')),
    jsonb_build_object(
      'full_name', p_full_name,
      'role', 'admin'
    ),
    now(),
    now(),
    '',
    '',
    '',
    ''
  )
  RETURNING id INTO v_user_id;

  -- Erstelle Profil für den Benutzer
  INSERT INTO public.profiles (
    id,
    username,
    full_name
  ) VALUES (
    v_user_id,
    p_email,
    p_full_name
  ) ON CONFLICT (id) DO NOTHING;

  -- Erstelle Admin-Rolle für den Benutzer
  INSERT INTO public.user_roles (
    user_id,
    role,
    company_id
  ) VALUES (
    v_user_id,
    'admin',
    p_company_id
  ) ON CONFLICT (user_id) DO UPDATE SET
    role = 'admin',
    company_id = p_company_id;

  -- Erstelle Admin-Einladung (für Tracking)
  INSERT INTO public.admin_invitations (
    company_id,
    email,
    full_name,
    phone,
    position,
    salutation,
    status,
    invitation_sent_at
  ) VALUES (
    p_company_id,
    p_email,
    p_full_name,
    p_phone,
    p_position,
    p_salutation,
    'completed',
    now()
  ) ON CONFLICT (company_id, email) DO UPDATE SET
    status = 'completed',
    invitation_sent_at = now();

  RETURN json_build_object(
    'success', true,
    'message', 'Admin-Benutzer erfolgreich erstellt',
    'user_id', v_user_id
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Fehler beim Erstellen des Admin-Benutzers: ' || SQLERRM
    );
END;
$$;