-- Funktion zum Erstellen eines Admin-Benutzers mit manuellem Passwort für Tests
CREATE OR REPLACE FUNCTION public.create_admin_user_with_password(
  p_email text,
  p_password text,
  p_company_id uuid,
  p_full_name text,
  p_phone text DEFAULT NULL,
  p_position text DEFAULT NULL,
  p_salutation text DEFAULT 'Herr'
) RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id uuid;
  v_result json;
BEGIN
  -- Erstelle den Benutzer in auth.users mit Passwort
  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    role,
    aud,
    confirmation_token,
    email_change_token_new,
    email_change,
    email_change_token_current,
    email_change_confirm_status,
    banned_until,
    recovery_token,
    phone_change_token,
    phone_change,
    phone_confirmed_at,
    phone_change_sent_at,
    confirmed_at,
    invitation_token,
    action_link,
    email_change_sent_at,
    recovery_sent_at,
    invited_at,
    confirmation_sent_at,
    last_sign_in_at
  ) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    p_email,
    crypt(p_password, gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider": "email", "providers": ["email"]}',
    jsonb_build_object('full_name', p_full_name),
    false,
    'authenticated',
    'authenticated',
    '',
    '',
    '',
    '',
    0,
    NULL,
    '',
    '',
    '',
    NULL,
    NULL,
    now(),
    '',
    '',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  ) RETURNING id INTO v_user_id;
  
  -- Erstelle eine Rolle für den Benutzer
  INSERT INTO public.user_roles (user_id, role, company_id)
  VALUES (v_user_id, 'admin', p_company_id);
  
  -- Erstelle eine Admin-Einladung (als "completed" da der Benutzer bereits erstellt wurde)
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
  );
  
  v_result := json_build_object(
    'success', true,
    'user_id', v_user_id,
    'message', 'Admin-Benutzer erfolgreich erstellt'
  );
  
  RETURN v_result;
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Fehler beim Erstellen des Admin-Benutzers: ' || SQLERRM
    );
END;
$function$;