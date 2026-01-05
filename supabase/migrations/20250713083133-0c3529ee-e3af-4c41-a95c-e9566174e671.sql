-- Aktiviere pgcrypto Extension für Passwort-Hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Erstelle die verbesserte Funktion zum direkten Erstellen eines Admin-Benutzers mit Passwort
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

  -- Generiere neue UUID für den Benutzer
  v_user_id := gen_random_uuid();

  -- Erstelle neuen Benutzer in auth.users
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    confirmation_sent_at,
    confirmation_token,
    recovery_token,
    email_change_token_new,
    email_change,
    raw_user_meta_data,
    user_metadata,
    is_super_admin,
    created_at,
    updated_at,
    phone,
    phone_confirmed_at,
    phone_change,
    phone_change_token,
    email_change_token_current,
    email_change_confirm_status,
    banned_until,
    reauthentication_token,
    reauthentication_sent_at
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    v_user_id,
    'authenticated',
    'authenticated',
    p_email,
    crypt(p_password, gen_salt('bf')),
    now(),
    now(),
    '',
    '',
    '',
    '',
    jsonb_build_object(
      'full_name', p_full_name,
      'role', 'admin'
    ),
    jsonb_build_object(
      'full_name', p_full_name,
      'role', 'admin'
    ),
    false,
    now(),
    now(),
    p_phone,
    CASE WHEN p_phone IS NOT NULL THEN now() ELSE NULL END,
    '',
    '',
    '',
    0,
    NULL,
    '',
    NULL
  );

  -- Erstelle Identität für den Benutzer
  INSERT INTO auth.identities (
    provider_id,
    user_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at,
    email
  ) VALUES (
    v_user_id::text,
    v_user_id,
    jsonb_build_object(
      'sub', v_user_id::text,
      'email', p_email,
      'email_verified', true,
      'phone_verified', p_phone IS NOT NULL
    ),
    'email',
    now(),
    now(),
    now(),
    p_email
  );

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