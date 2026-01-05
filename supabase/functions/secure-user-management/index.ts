import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Verify the user's JWT token
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)
    
    if (authError || !user) {
      throw new Error('Invalid authentication')
    }

    // Check if user has admin privileges
    const { data: userRole } = await supabaseClient
      .from('user_roles')
      .select('role, company_id')
      .eq('user_id', user.id)
      .single()

    if (!userRole || !['admin', 'superadmin'].includes(userRole.role)) {
      throw new Error('Insufficient permissions')
    }

    const { method } = req
    const { pathname } = new URL(req.url)

    // GET: Liste aller Benutzer
    if (method === 'GET' && pathname === '/secure-user-management') {
      let query = supabaseClient
        .from('profiles')
        .select(`
          id,
          full_name,
          user_roles!inner(role, company_id),
          created_at
        `)

      if (userRole.role !== 'superadmin' && userRole.company_id) {
        query = query.eq('user_roles.company_id', userRole.company_id)
      }

      const { data: profiles, error } = await query

      if (error) throw error

      const { data: authUsers } = await supabaseClient.auth.admin.listUsers()
      
      const users = profiles?.map(profile => {
        const authUser = authUsers.users.find(au => au.id === profile.id)
        const role = Array.isArray(profile.user_roles) ? profile.user_roles[0] : profile.user_roles
        return {
          id: profile.id,
          email: authUser?.email || 'N/A',
          full_name: profile.full_name,
          role: role?.role,
          company_id: role?.company_id,
          created_at: profile.created_at,
          last_sign_in_at: authUser?.last_sign_in_at
        }
      }) || []

      return new Response(
        JSON.stringify({ users }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // GET: Kontostatus eines Benutzers
    if (method === 'GET' && pathname.includes('/secure-user-management/status/')) {
      const userId = pathname.split('/status/').pop()
      
      if (!userId) throw new Error('User ID required')

      // Hole Kontostatus
      let { data: status } = await supabaseClient
        .from('user_account_status')
        .select('*')
        .eq('user_id', userId)
        .single()

      // Wenn kein Status existiert, erstelle einen
      if (!status) {
        const { data: newStatus } = await supabaseClient
          .from('user_account_status')
          .insert({ user_id: userId })
          .select()
          .single()
        status = newStatus
      }

      // Hole Login-Historie
      const { data: loginHistory } = await supabaseClient
        .from('user_login_history')
        .select('*')
        .eq('user_id', userId)
        .order('login_at', { ascending: false })
        .limit(30)

      // Hole Auth-User Info
      const { data: authUser } = await supabaseClient.auth.admin.getUserById(userId)

      return new Response(
        JSON.stringify({ 
          status, 
          loginHistory: loginHistory || [],
          authUser: authUser?.user ? {
            email: authUser.user.email,
            last_sign_in_at: authUser.user.last_sign_in_at,
            created_at: authUser.user.created_at,
            confirmed_at: authUser.user.confirmed_at
          } : null
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // POST: Benutzer erstellen
    if (method === 'POST' && pathname === '/secure-user-management/create') {
      const { email, role, company_id, full_name } = await req.json()

      if (!email || !role) {
        throw new Error('Email and role are required')
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email) || email.length > 254) {
        throw new Error('Invalid email format')
      }

      const validRoles = ['employee', 'admin', 'superadmin', 'moderator', 'hr', 'manager', 'hr_manager']
      if (!validRoles.includes(role)) {
        throw new Error('Invalid role')
      }

      if (full_name && (typeof full_name !== 'string' || full_name.length > 255)) {
        throw new Error('Invalid full name')
      }

      if (company_id) {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
        if (!uuidRegex.test(company_id)) {
          throw new Error('Invalid company ID format')
        }
      }

      const { data: newUser, error: createError } = await supabaseClient.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: { role, company_id, full_name }
      })

      if (createError) throw createError

      await supabaseClient.from('profiles').insert({
        id: newUser.user.id,
        full_name
      })

      await supabaseClient.from('user_roles').insert({
        user_id: newUser.user.id,
        role,
        company_id
      })

      // Erstelle Kontostatus-Eintrag
      await supabaseClient.from('user_account_status').insert({
        user_id: newUser.user.id
      })

      return new Response(
        JSON.stringify({ success: true, user: newUser.user }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // POST: Benutzer sperren
    if (method === 'POST' && pathname === '/secure-user-management/suspend') {
      const { userId, reason } = await req.json()

      if (!userId) throw new Error('User ID required')
      if (userId === user.id) throw new Error('Cannot suspend your own account')

      // Update Kontostatus
      await supabaseClient
        .from('user_account_status')
        .upsert({
          user_id: userId,
          is_suspended: true,
          suspended_at: new Date().toISOString(),
          suspended_by: user.id,
          suspended_reason: reason || 'Vom Administrator gesperrt'
        }, { onConflict: 'user_id' })

      // Benutzer in Auth deaktivieren
      await supabaseClient.auth.admin.updateUserById(userId, {
        ban_duration: '876000h' // ~100 Jahre = effektiv permanent
      })

      return new Response(
        JSON.stringify({ success: true, message: 'Benutzer wurde gesperrt' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // POST: Benutzer entsperren
    if (method === 'POST' && pathname === '/secure-user-management/unsuspend') {
      const { userId } = await req.json()

      if (!userId) throw new Error('User ID required')

      // Update Kontostatus
      await supabaseClient
        .from('user_account_status')
        .update({
          is_suspended: false,
          suspended_at: null,
          suspended_by: null,
          suspended_reason: null
        })
        .eq('user_id', userId)

      // Ban aufheben
      await supabaseClient.auth.admin.updateUserById(userId, {
        ban_duration: 'none'
      })

      return new Response(
        JSON.stringify({ success: true, message: 'Benutzer wurde entsperrt' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // POST: Passwort zurücksetzen
    if (method === 'POST' && pathname === '/secure-user-management/reset-password') {
      const { userId } = await req.json()

      if (!userId) throw new Error('User ID required')

      // Hole E-Mail des Benutzers
      const { data: authUser } = await supabaseClient.auth.admin.getUserById(userId)
      if (!authUser?.user?.email) throw new Error('User email not found')

      // Sende Passwort-Reset-Link
      const { error } = await supabaseClient.auth.resetPasswordForEmail(authUser.user.email, {
        redirectTo: `${Deno.env.get('SITE_URL') || 'https://localhost:5173'}/reset-password`
      })

      if (error) throw error

      // Update Kontostatus
      await supabaseClient
        .from('user_account_status')
        .upsert({
          user_id: userId,
          last_password_reset: new Date().toISOString()
        }, { onConflict: 'user_id' })

      return new Response(
        JSON.stringify({ success: true, message: 'Passwort-Reset-Link wurde gesendet' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // POST: Zugangsdaten erneut senden
    if (method === 'POST' && pathname === '/secure-user-management/resend-credentials') {
      const { userId } = await req.json()

      if (!userId) throw new Error('User ID required')

      // Hole E-Mail des Benutzers
      const { data: authUser } = await supabaseClient.auth.admin.getUserById(userId)
      if (!authUser?.user?.email) throw new Error('User email not found')

      // Generiere ein temporäres Passwort oder sende Magic Link
      const { error } = await supabaseClient.auth.resetPasswordForEmail(authUser.user.email, {
        redirectTo: `${Deno.env.get('SITE_URL') || 'https://localhost:5173'}/set-password`
      })

      if (error) throw error

      // Update Kontostatus
      await supabaseClient
        .from('user_account_status')
        .upsert({
          user_id: userId,
          last_credentials_sent: new Date().toISOString()
        }, { onConflict: 'user_id' })

      return new Response(
        JSON.stringify({ success: true, message: 'Zugangsdaten wurden erneut gesendet' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // POST: Alle Sessions beenden
    if (method === 'POST' && pathname === '/secure-user-management/terminate-sessions') {
      const { userId } = await req.json()

      if (!userId) throw new Error('User ID required')

      // Signout für den Benutzer erzwingen
      await supabaseClient.auth.admin.signOut(userId, 'global')

      return new Response(
        JSON.stringify({ success: true, message: 'Alle Sessions wurden beendet' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // POST: 2FA zurücksetzen
    if (method === 'POST' && pathname === '/secure-user-management/reset-2fa') {
      const { userId } = await req.json()

      if (!userId) throw new Error('User ID required')

      // Lösche alle MFA-Faktoren des Benutzers
      const { data: factors } = await supabaseClient.auth.admin.mfa.listFactors({ userId })
      
      if (factors?.factors) {
        for (const factor of factors.factors) {
          await supabaseClient.auth.admin.mfa.deleteFactor({
            id: factor.id,
            userId
          })
        }
      }

      // Update Kontostatus
      await supabaseClient
        .from('user_account_status')
        .update({
          two_factor_enabled: false,
          two_factor_reset_at: new Date().toISOString()
        })
        .eq('user_id', userId)

      return new Response(
        JSON.stringify({ success: true, message: '2FA wurde zurückgesetzt' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // POST: Neues Benutzerkonto erstellen und mit Mitarbeiter verknüpfen
    if (method === 'POST' && pathname === '/secure-user-management/create-account') {
      const { employeeId, email, role, sendInvitation } = await req.json()

      if (!employeeId || !email) {
        throw new Error('Employee ID and email are required')
      }

      // Prüfe ob Mitarbeiter existiert
      const { data: employee, error: empError } = await supabaseClient
        .from('employees')
        .select('id, first_name, last_name, email, user_id')
        .eq('id', employeeId)
        .single()

      if (empError || !employee) {
        throw new Error('Employee not found')
      }

      if (employee.user_id) {
        throw new Error('Employee already has a linked user account')
      }

      // Erstelle neuen Auth-Benutzer
      const { data: newUser, error: createError } = await supabaseClient.auth.admin.createUser({
        email,
        email_confirm: !sendInvitation,
        user_metadata: { 
          role: role || 'employee', 
          company_id: userRole.company_id, 
          full_name: `${employee.first_name} ${employee.last_name}` 
        }
      })

      if (createError) throw createError

      // Erstelle Profil
      await supabaseClient.from('profiles').upsert({
        id: newUser.user.id,
        full_name: `${employee.first_name} ${employee.last_name}`
      })

      // Erstelle Rolle
      await supabaseClient.from('user_roles').upsert({
        user_id: newUser.user.id,
        role: role || 'employee',
        company_id: userRole.company_id
      })

      // Erstelle Kontostatus-Eintrag
      await supabaseClient.from('user_account_status').insert({
        user_id: newUser.user.id
      })

      // Verknüpfe mit Mitarbeiter
      const { error: updateError } = await supabaseClient
        .from('employees')
        .update({ user_id: newUser.user.id })
        .eq('id', employeeId)

      if (updateError) throw updateError

      // Sende Einladung wenn gewünscht
      if (sendInvitation) {
        await supabaseClient.auth.resetPasswordForEmail(email, {
          redirectTo: `${Deno.env.get('SITE_URL') || 'https://localhost:5173'}/set-password`
        })
      }

      return new Response(
        JSON.stringify({ success: true, user: newUser.user }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // POST: Bestehendes Benutzerkonto mit Mitarbeiter verknüpfen
    if (method === 'POST' && pathname === '/secure-user-management/link-account') {
      const { employeeId, userId: linkUserId } = await req.json()

      if (!employeeId || !linkUserId) {
        throw new Error('Employee ID and User ID are required')
      }

      // Prüfe ob Mitarbeiter existiert und noch nicht verknüpft ist
      const { data: employee, error: empError } = await supabaseClient
        .from('employees')
        .select('id, user_id')
        .eq('id', employeeId)
        .single()

      if (empError || !employee) {
        throw new Error('Employee not found')
      }

      if (employee.user_id) {
        throw new Error('Employee already has a linked user account')
      }

      // Prüfe ob User existiert und noch nicht mit einem anderen Mitarbeiter verknüpft ist
      const { data: existingLink } = await supabaseClient
        .from('employees')
        .select('id')
        .eq('user_id', linkUserId)
        .single()

      if (existingLink) {
        throw new Error('This user account is already linked to another employee')
      }

      // Verknüpfe
      const { error: updateError } = await supabaseClient
        .from('employees')
        .update({ user_id: linkUserId })
        .eq('id', employeeId)

      if (updateError) throw updateError

      return new Response(
        JSON.stringify({ success: true, message: 'Benutzerkonto wurde verknüpft' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // POST: Verknüpfung aufheben
    if (method === 'POST' && pathname === '/secure-user-management/unlink-account') {
      const { employeeId } = await req.json()

      if (!employeeId) {
        throw new Error('Employee ID is required')
      }

      const { error: updateError } = await supabaseClient
        .from('employees')
        .update({ user_id: null })
        .eq('id', employeeId)

      if (updateError) throw updateError

      return new Response(
        JSON.stringify({ success: true, message: 'Verknüpfung wurde aufgehoben' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // GET: Liste nicht verknüpfter Benutzer
    if (method === 'GET' && pathname === '/secure-user-management/unlinked-users') {
      // Hole alle Benutzer die NICHT mit einem Mitarbeiter verknüpft sind
      const { data: linkedUserIds } = await supabaseClient
        .from('employees')
        .select('user_id')
        .not('user_id', 'is', null)

      const linkedIds = linkedUserIds?.map(e => e.user_id).filter(Boolean) || []

      // Hole Auth-Users
      const { data: authUsers } = await supabaseClient.auth.admin.listUsers()
      
      // Filtere auf Company
      const { data: userRoles } = await supabaseClient
        .from('user_roles')
        .select('user_id, role')
        .eq('company_id', userRole.company_id)

      const companyUserIds = new Set(userRoles?.map(ur => ur.user_id) || [])

      const unlinkedUsers = authUsers.users
        .filter(au => !linkedIds.includes(au.id) && companyUserIds.has(au.id))
        .map(au => ({
          id: au.id,
          email: au.email,
          created_at: au.created_at
        }))

      return new Response(
        JSON.stringify({ users: unlinkedUsers }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // POST: Zugangsdaten an Mitarbeiter senden (per employeeId)
    if (method === 'POST' && pathname === '/secure-user-management/send-credentials-by-employee') {
      const { employeeId } = await req.json()

      if (!employeeId) {
        throw new Error('Employee ID is required')
      }

      console.log('[send-credentials-by-employee] Starting for employeeId:', employeeId)

      // Lade Mitarbeiter-Daten
      const { data: employee, error: empError } = await supabaseClient
        .from('employees')
        .select('id, email, first_name, last_name, user_id, company_id')
        .eq('id', employeeId)
        .single()

      if (empError || !employee) {
        console.error('[send-credentials-by-employee] Employee not found:', empError)
        throw new Error('Mitarbeiter nicht gefunden')
      }

      console.log('[send-credentials-by-employee] Employee found:', { 
        email: employee.email, 
        user_id: employee.user_id,
        first_name: employee.first_name,
        last_name: employee.last_name
      })

      if (!employee.email) {
        throw new Error('Mitarbeiter hat keine E-Mail-Adresse')
      }

      let targetUserId = employee.user_id
      const companyId = employee.company_id || userRole.company_id

      // Wenn kein user_id vorhanden, erstelle Auth-User oder verknüpfe bestehenden
      if (!targetUserId) {
        console.log('[send-credentials-by-employee] No user_id, checking for existing Auth-User...')
        
        const fullName = `${employee.first_name || ''} ${employee.last_name || ''}`.trim()
        
        // Zuerst prüfen ob ein Auth-User mit dieser E-Mail bereits existiert
        const targetEmail = employee.email.toLowerCase()
        let existingAuthUser: any = null

        // Strategie 1: Versuche getUserByEmail (falls in der API verfügbar)
        try {
          const adminAny = supabaseClient.auth.admin as any
          if (typeof adminAny.getUserByEmail === 'function') {
            const { data: userByEmail, error: getByEmailError } = await adminAny.getUserByEmail(targetEmail)
            if (!getByEmailError && userByEmail?.user) {
              existingAuthUser = userByEmail.user
              console.log('[send-credentials-by-employee] Found existing Auth-User via getUserByEmail:', existingAuthUser.id)
            }
          }
        } catch (e) {
          console.warn('[send-credentials-by-employee] getUserByEmail not available/failed')
        }

        // Strategie 2: Suche in der auth.users Tabelle direkt via RPC
        if (!existingAuthUser) {
          console.log('[send-credentials-by-employee] Trying RPC get_user_id_by_email...')
          try {
            const { data: authUserData, error: authQueryError } = await supabaseClient.rpc('get_user_id_by_email', { 
              p_email: targetEmail 
            })
            
            if (authQueryError) {
              console.warn('[send-credentials-by-employee] RPC lookup error:', authQueryError.message)
            } else if (authUserData) {
              existingAuthUser = { id: authUserData, email: targetEmail }
              console.log('[send-credentials-by-employee] Found existing Auth-User via RPC:', authUserData)
            }
          } catch (rpcError) {
            console.warn('[send-credentials-by-employee] RPC lookup threw exception:', rpcError)
          }
        }

        // KEIN listUsers Fallback mehr - dieser funktioniert nicht zuverlässig
        // Wenn wir hier keinen User gefunden haben, versuchen wir createUser
        // Falls createUser mit "email_exists" fehlschlägt, wird dort nochmal gesucht

        if (!existingAuthUser) {
          console.log('[send-credentials-by-employee] No existing Auth-User found, will try to create a new one')
        }
        if (existingAuthUser) {
          console.log('[send-credentials-by-employee] Found existing Auth-User:', existingAuthUser.id)
          
          // Prüfe ob dieser User bereits mit einem anderen Mitarbeiter verknüpft ist
          const { data: linkedEmployee } = await supabaseClient
            .from('employees')
            .select('id, first_name, last_name')
            .eq('user_id', existingAuthUser.id)
            .single()
          
          if (linkedEmployee && linkedEmployee.id !== employeeId) {
            throw new Error(`Dieses Benutzerkonto ist bereits mit Mitarbeiter "${linkedEmployee.first_name} ${linkedEmployee.last_name}" verknüpft`)
          }
          
          targetUserId = existingAuthUser.id
          
          // Verknüpfe mit diesem Mitarbeiter
          await supabaseClient
            .from('employees')
            .update({ user_id: targetUserId })
            .eq('id', employeeId)
          
          // Stelle sicher dass Profil und Rolle existieren
          await supabaseClient.from('profiles').upsert({
            id: targetUserId,
            full_name: fullName || existingAuthUser.user_metadata?.full_name
          })
          
          await supabaseClient.from('user_roles').upsert({
            user_id: targetUserId,
            role: 'employee',
            company_id: companyId
          })
          
          await supabaseClient.from('user_account_status').upsert({
            user_id: targetUserId
          }, { onConflict: 'user_id' })
          
          console.log('[send-credentials-by-employee] Existing user linked to employee')
        } else {
          // Kein bestehender User, erstelle neuen
          console.log('[send-credentials-by-employee] Creating new Auth-User...')
          
          const { data: newUser, error: createError } = await supabaseClient.auth.admin.createUser({
            email: employee.email,
            email_confirm: true,
            user_metadata: { 
              role: 'employee', 
              company_id: companyId, 
              full_name: fullName 
            }
          })

          if (createError) {
            console.error('[send-credentials-by-employee] Failed to create user:', createError)

            const createAny = createError as any
            const isEmailExists = createAny?.code === 'email_exists' || String(createAny?.message || '').includes('already been registered')

            // Falls E-Mail bereits existiert: User suchen und verknüpfen statt Fehler werfen
            if (isEmailExists) {
              console.warn('[send-credentials-by-employee] Email already exists - trying to find and link existing user')

              const targetEmail = employee.email.toLowerCase()
              let foundUser: any = null

              // Versuch: getUserByEmail falls verfügbar
              try {
                const adminAny = supabaseClient.auth.admin as any
                if (typeof adminAny.getUserByEmail === 'function') {
                  const { data: userByEmail, error: getByEmailError } = await adminAny.getUserByEmail(targetEmail)
                  if (!getByEmailError && userByEmail?.user) {
                    foundUser = userByEmail.user
                    console.log('[send-credentials-by-employee] Found existing user via getUserByEmail:', foundUser.id)
                  }
                }
              } catch (_) {
                // ignore
              }

              // Fallback: RPC Funktion nochmal versuchen
              if (!foundUser) {
                console.log('[send-credentials-by-employee] Trying RPC lookup again after email_exists...')
                try {
                  const { data: authUserData, error: authQueryError } = await supabaseClient.rpc('get_user_id_by_email', { 
                    p_email: targetEmail 
                  })
                  
                  if (!authQueryError && authUserData) {
                    foundUser = { id: authUserData, email: targetEmail }
                    console.log('[send-credentials-by-employee] Found existing user via RPC after email_exists:', authUserData)
                  }
                } catch (rpcError) {
                  console.warn('[send-credentials-by-employee] RPC lookup failed after email_exists:', rpcError)
                }
              }

              if (!foundUser) {
                throw new Error('Ein Benutzer mit dieser E-Mail existiert bereits in der Datenbank, konnte aber nicht gefunden werden. Bitte prüfen Sie, ob die Migration für "get_user_id_by_email" ausgeführt wurde.')
              }

              // Prüfe ob bereits an anderen Mitarbeiter gebunden
              const { data: linkedEmployee } = await supabaseClient
                .from('employees')
                .select('id, first_name, last_name')
                .eq('user_id', foundUser.id)
                .single()

              if (linkedEmployee && linkedEmployee.id !== employeeId) {
                throw new Error(`Dieses Benutzerkonto ist bereits mit Mitarbeiter "${linkedEmployee.first_name} ${linkedEmployee.last_name}" verknüpft`)
              }

              targetUserId = foundUser.id

              await supabaseClient
                .from('employees')
                .update({ user_id: targetUserId })
                .eq('id', employeeId)

              await supabaseClient.from('profiles').upsert({
                id: targetUserId,
                full_name: fullName || foundUser.user_metadata?.full_name
              })

              await supabaseClient.from('user_roles').upsert({
                user_id: targetUserId,
                role: 'employee',
                company_id: companyId
              })

              await supabaseClient.from('user_account_status').upsert({
                user_id: targetUserId
              }, { onConflict: 'user_id' })

              console.log('[send-credentials-by-employee] Linked existing user after email_exists:', targetUserId)
            } else {
              throw new Error(`Benutzerkonto konnte nicht erstellt werden: ${createError.message}`)
            }
          } else {
            if (!newUser?.user?.id) {
              throw new Error('Benutzerkonto konnte nicht erstellt werden (kein User zurückgegeben)')
            }

            targetUserId = newUser.user.id
            console.log('[send-credentials-by-employee] Created new user:', targetUserId)

            // Erstelle Profil
            await supabaseClient.from('profiles').upsert({
              id: targetUserId,
              full_name: fullName
            })

            // Erstelle Rolle
            await supabaseClient.from('user_roles').upsert({
              user_id: targetUserId,
              role: 'employee',
              company_id: companyId
            })

            // Erstelle Kontostatus-Eintrag
            await supabaseClient.from('user_account_status').upsert({
              user_id: targetUserId
            }, { onConflict: 'user_id' })

            // Verknüpfe mit Mitarbeiter
            await supabaseClient
              .from('employees')
              .update({ user_id: targetUserId })
              .eq('id', employeeId)

            console.log('[send-credentials-by-employee] New user linked to employee')
          }
        }
      }

      // Generiere Password-Reset-Link mit generateLink
      const siteUrl = Deno.env.get('SITE_URL') || 'https://teydpbqficbdgqovoqlo.lovableproject.com'
      console.log('[send-credentials-by-employee] Generating link with SITE_URL:', siteUrl)
      
      const { data: linkData, error: linkError } = await supabaseClient.auth.admin.generateLink({
        type: 'recovery',
        email: employee.email,
        options: {
          redirectTo: `${siteUrl}/set-password`
        }
      })

      if (linkError || !linkData?.properties?.action_link) {
        console.error('[send-credentials-by-employee] Failed to generate link:', linkError)
        throw new Error('Zugangsdaten-Link konnte nicht generiert werden')
      }

      const actionLink = linkData.properties.action_link
      console.log('[send-credentials-by-employee] Link generated successfully')

      // Hole Firmenname
      let companyName = 'MINUTE'
      if (companyId) {
        const { data: company } = await supabaseClient
          .from('companies')
          .select('name')
          .eq('id', companyId)
          .single()
        if (company?.name) {
          companyName = company.name
        }
      }

      // Sende E-Mail via Resend
      const resendApiKey = Deno.env.get('RESEND_API_KEY')
      if (!resendApiKey) {
        console.error('[send-credentials-by-employee] RESEND_API_KEY not configured')
        throw new Error('E-Mail-Dienst nicht konfiguriert')
      }

      const fullName = `${employee.first_name || ''} ${employee.last_name || ''}`.trim() || 'Mitarbeiter'

      console.log('[send-credentials-by-employee] Sending email to:', employee.email)

      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: #4F46E5; color: white !important; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
            .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Willkommen bei ${companyName}</h1>
            </div>
            <div class="content">
              <p>Hallo ${fullName},</p>
              <p>Ihr Benutzerkonto wurde erstellt. Klicken Sie auf den folgenden Button, um Ihr Passwort festzulegen und sich anzumelden:</p>
              <p style="text-align: center;">
                <a href="${actionLink}" class="button">Passwort festlegen</a>
              </p>
              <p><strong>Wichtig:</strong> Dieser Link ist 24 Stunden gültig.</p>
              <p>Falls der Button nicht funktioniert, kopieren Sie diesen Link in Ihren Browser:</p>
              <p style="word-break: break-all; font-size: 12px; color: #6b7280;">${actionLink}</p>
            </div>
            <div class="footer">
              <p>Diese E-Mail wurde automatisch generiert von MINUTE.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      const emailResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'MINUTE <onboarding@resend.dev>',
          to: [employee.email],
          subject: `Ihre Zugangsdaten für ${companyName}`,
          html: emailHtml,
        }),
      })

      const emailResponseBody = await emailResponse.text()
      console.log('[send-credentials-by-employee] Resend response status:', emailResponse.status)

      if (!emailResponse.ok) {
        console.error('[send-credentials-by-employee] Resend error body:', emailResponseBody)
        throw new Error(
          `E-Mail konnte nicht versendet werden (Resend ${emailResponse.status}). ` +
          `Bitte prüfen Sie RESEND_API_KEY und ob Ihre Domain in Resend verifiziert ist.`
        )
      }

      console.log('[send-credentials-by-employee] Email sent successfully')

      // Update Kontostatus
      await supabaseClient
        .from('user_account_status')
        .upsert({
          user_id: targetUserId,
          last_credentials_sent: new Date().toISOString()
        }, { onConflict: 'user_id' })

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Zugangsdaten wurden an ' + employee.email + ' gesendet',
          email: employee.email,
          user_id: targetUserId
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // DELETE: Benutzer löschen
    if (method === 'DELETE' && pathname.includes('/secure-user-management/')) {
      const userId = pathname.split('/').pop()
      
      if (!userId) throw new Error('User ID required')
      if (userId === user.id) throw new Error('Cannot delete your own account')

      // Entferne Verknüpfung zum Mitarbeiter
      await supabaseClient
        .from('employees')
        .update({ user_id: null })
        .eq('user_id', userId)

      const { error } = await supabaseClient.auth.admin.deleteUser(userId)
      
      if (error) throw error

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})