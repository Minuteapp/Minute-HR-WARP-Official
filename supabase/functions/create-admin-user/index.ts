import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CreateAdminUserRequest {
  email: string
  password: string
  companyId: string
  fullName: string
  phone?: string
  position?: string
  salutation?: string
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client with service role key for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { email, password, companyId, fullName, phone, position, salutation = 'Herr' }: CreateAdminUserRequest = await req.json()

    console.log('Creating admin user for:', email, 'company:', companyId)

    // Check if user already exists
    const { data: existingUsers, error: userCheckError } = await supabaseAdmin
      .rpc('check_email_exists', { email_to_check: email })
      
    if (userCheckError) {
      console.error('Error checking existing user:', userCheckError)
    }
    
    if (existingUsers) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Ein Benutzer mit dieser E-Mail-Adresse ist bereits registriert.'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Create user using signUp with auto-confirm
    const { data: authData, error: authError } = await supabaseAdmin.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: 'admin'
        },
        emailRedirectTo: undefined
      }
    })

    if (authError || !authData.user) {
      console.error('Auth error:', authError)
      return new Response(
        JSON.stringify({
          success: false,
          message: `Fehler beim Erstellen des Benutzers: ${authError?.message || 'Unbekannter Fehler'}`
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const userId = authData.user.id
    
    // Manually confirm the user's email using admin privileges
    const confirmResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/auth/v1/admin/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
        'Content-Type': 'application/json',
        'apikey': Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
      },
      body: JSON.stringify({
        email_confirm: true
      })
    })

    if (!confirmResponse.ok) {
      console.error('Email confirmation failed:', await confirmResponse.text())
    }
    console.log('User created with ID:', userId)

    // Create profile
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: userId,
        username: email,
        full_name: fullName
      })

    if (profileError) {
      console.error('Profile creation error:', profileError)
    }

    // Create admin role
    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .upsert({
        user_id: userId,
        role: 'admin',
        company_id: companyId
      })

    if (roleError) {
      console.error('Role creation error:', roleError)
    }

    // Update admin invitation status
    const { error: invitationError } = await supabaseAdmin
      .from('admin_invitations')
      .upsert({
        company_id: companyId,
        email,
        full_name: fullName,
        phone,
        position,
        salutation,
        status: 'completed',
        invitation_sent_at: new Date().toISOString()
      })

    if (invitationError) {
      console.error('Invitation update error:', invitationError)
    }

    console.log('Admin user creation completed successfully')

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Admin-Benutzer erfolgreich erstellt',
        user_id: userId
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        message: `Unerwarteter Fehler: ${error instanceof Error ? error.message : 'Unknown error'}`
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})