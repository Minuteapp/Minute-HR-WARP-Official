import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Create Supabase client with service role for admin operations
const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

// Helper to verify superadmin status
async function verifySuperadmin(authHeader: string | null): Promise<{ userId: string; error?: string }> {
  if (!authHeader) {
    return { userId: '', error: 'No authorization header' }
  }

  const token = authHeader.replace('Bearer ', '')
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)

  if (error || !user) {
    return { userId: '', error: 'Invalid token' }
  }

  // Check if user is superadmin
  const { data: isSuperadmin } = await supabaseAdmin.rpc('is_superadmin', { user_id: user.id })
  
  if (!isSuperadmin) {
    return { userId: '', error: 'Not a superadmin' }
  }

  return { userId: user.id }
}

// Audit log helper
async function logAudit(
  actorId: string,
  action: string,
  targetTenantId: string | null,
  targetUserId: string | null,
  requestPayload: any,
  responsePayload: any,
  status: 'success' | 'error',
  errorMessage: string | null,
  request: Request
) {
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('cf-connecting-ip') || null
  const userAgent = request.headers.get('user-agent') || null

  await supabaseAdmin.from('superadmin_audit_log').insert({
    actor_superadmin_id: actorId,
    action,
    target_tenant_id: targetTenantId,
    target_user_id: targetUserId,
    request_payload: requestPayload,
    response_payload: responsePayload,
    status,
    error_message: errorMessage,
    ip_address: ip,
    user_agent: userAgent
  })
}

// POST /tenants - Create new tenant
async function createTenant(actorId: string, body: any, request: Request) {
  const { name, country, timezone, industry } = body

  if (!name) {
    return { error: 'Name is required', status: 400 }
  }

  // Check if tenant name already exists
  const { data: existing } = await supabaseAdmin
    .from('companies')
    .select('id')
    .eq('name', name)
    .single()

  if (existing) {
    return { error: 'Tenant with this name already exists', status: 409 }
  }

  // Create tenant
  const { data: tenant, error } = await supabaseAdmin
    .from('companies')
    .insert({
      name,
      country: country || 'DE',
      status: 'active',
      industry: industry || null,
      metadata: { timezone: timezone || 'Europe/Berlin' }
    })
    .select()
    .single()

  if (error) {
    await logAudit(actorId, 'CREATE_TENANT', null, null, body, null, 'error', error.message, request)
    return { error: error.message, status: 500 }
  }

  await logAudit(actorId, 'CREATE_TENANT', tenant.id, null, body, tenant, 'success', null, request)

  return { data: tenant, status: 201 }
}

// POST /tenants/{id}/users/invite - Invite user to tenant
async function inviteUser(actorId: string, tenantId: string, body: any, request: Request) {
  const { email, role, full_name, department_id, team_id, site_id } = body

  if (!email || !role) {
    return { error: 'Email and role are required', status: 400 }
  }

  const validRoles = ['employee', 'teamlead', 'hr', 'admin']
  if (!validRoles.includes(role)) {
    return { error: `Invalid role. Must be one of: ${validRoles.join(', ')}`, status: 400 }
  }

  // Check if tenant exists
  const { data: tenant, error: tenantError } = await supabaseAdmin
    .from('companies')
    .select('id, name')
    .eq('id', tenantId)
    .single()

  if (tenantError || !tenant) {
    return { error: 'Tenant not found', status: 404 }
  }

  // Check if user already exists in this tenant
  const { data: existingEmployee } = await supabaseAdmin
    .from('employees')
    .select('id')
    .eq('company_id', tenantId)
    .eq('email', email)
    .single()

  if (existingEmployee) {
    return { error: 'User already exists in this tenant', status: 409 }
  }

  // Invite user via Supabase Auth
  const { data: authUser, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
    data: {
      full_name: full_name || email.split('@')[0],
      company_id: tenantId,
      invited_by_superadmin: true
    }
  })

  if (inviteError) {
    await logAudit(actorId, 'INVITE_USER', tenantId, null, body, null, 'error', inviteError.message, request)
    return { error: inviteError.message, status: 500 }
  }

  // Create employee record
  const { data: employee, error: empError } = await supabaseAdmin
    .from('employees')
    .insert({
      company_id: tenantId,
      user_id: authUser.user.id,
      email,
      first_name: full_name?.split(' ')[0] || email.split('@')[0],
      last_name: full_name?.split(' ').slice(1).join(' ') || '',
      role,
      status: 'pending',
      department_id: department_id || null,
      team_id: team_id || null,
      location_id: site_id || null,
      created_by_superadmin: actorId,
      is_test_user: false
    })
    .select()
    .single()

  if (empError) {
    console.error('Employee creation error:', empError)
    // Still log success for auth invite
  }

  // Create user_roles mapping
  await supabaseAdmin.from('user_roles').insert({
    user_id: authUser.user.id,
    role,
    company_id: tenantId,
    assigned_by: actorId
  })

  const response = {
    user_id: authUser.user.id,
    employee_id: employee?.id,
    email,
    role,
    invite_status: 'sent'
  }

  await logAudit(actorId, 'INVITE_USER', tenantId, authUser.user.id, body, response, 'success', null, request)

  return { data: response, status: 201 }
}

// POST /tenants/{id}/users/create-test - Create test user
async function createTestUser(actorId: string, tenantId: string, body: any, request: Request) {
  const { full_name, role, email } = body

  if (!role) {
    return { error: 'Role is required', status: 400 }
  }

  const validRoles = ['employee', 'teamlead', 'hr', 'admin']
  if (!validRoles.includes(role)) {
    return { error: `Invalid role. Must be one of: ${validRoles.join(', ')}`, status: 400 }
  }

  // Check if tenant exists
  const { data: tenant, error: tenantError } = await supabaseAdmin
    .from('companies')
    .select('id, name')
    .eq('id', tenantId)
    .single()

  if (tenantError || !tenant) {
    return { error: 'Tenant not found', status: 404 }
  }

  // Generate test email and password
  const testEmail = email || `test-${crypto.randomUUID().slice(0, 8)}@tenant-${tenantId.slice(0, 8)}.test`
  const testPassword = `Test${crypto.randomUUID().slice(0, 12)}!`

  // Create user in Supabase Auth
  const { data: authUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
    email: testEmail,
    password: testPassword,
    email_confirm: true, // Auto-confirm for test users
    user_metadata: {
      full_name: full_name || `Test User (${role})`,
      company_id: tenantId,
      is_test_user: true,
      created_by_superadmin: actorId
    }
  })

  if (createError) {
    await logAudit(actorId, 'CREATE_TEST_USER', tenantId, null, body, null, 'error', createError.message, request)
    return { error: createError.message, status: 500 }
  }

  // Create employee record
  const { data: employee, error: empError } = await supabaseAdmin
    .from('employees')
    .insert({
      company_id: tenantId,
      user_id: authUser.user.id,
      email: testEmail,
      first_name: full_name?.split(' ')[0] || 'Test',
      last_name: full_name?.split(' ').slice(1).join(' ') || `User (${role})`,
      role,
      status: 'active',
      created_by_superadmin: actorId,
      is_test_user: true
    })
    .select()
    .single()

  if (empError) {
    console.error('Employee creation error:', empError)
  }

  // Create user_roles mapping
  await supabaseAdmin.from('user_roles').insert({
    user_id: authUser.user.id,
    role,
    company_id: tenantId,
    assigned_by: actorId
  })

  const response = {
    user_id: authUser.user.id,
    employee_id: employee?.id,
    email: testEmail,
    role,
    credentials: {
      email: testEmail,
      password: testPassword
    },
    is_test_user: true
  }

  await logAudit(actorId, 'CREATE_TEST_USER', tenantId, authUser.user.id, { ...body, email: testEmail }, { ...response, credentials: '[REDACTED]' }, 'success', null, request)

  return { data: response, status: 201 }
}

// POST /tenants/{id}/org/bootstrap - Create minimal org structure
async function bootstrapOrg(actorId: string, tenantId: string, request: Request) {
  // Check if tenant exists
  const { data: tenant, error: tenantError } = await supabaseAdmin
    .from('companies')
    .select('id, name')
    .eq('id', tenantId)
    .single()

  if (tenantError || !tenant) {
    return { error: 'Tenant not found', status: 404 }
  }

  const created: { site_id?: string; department_id?: string; team_id?: string } = {}
  const skipped: string[] = []

  // Check and create location/site
  const { data: existingLocations } = await supabaseAdmin
    .from('locations')
    .select('id')
    .eq('company_id', tenantId)
    .limit(1)

  if (!existingLocations || existingLocations.length === 0) {
    const { data: location, error } = await supabaseAdmin
      .from('locations')
      .insert({
        company_id: tenantId,
        name: 'Hauptstandort',
        is_active: true,
        country: tenant.name.includes('AT') ? 'AT' : 'DE'
      })
      .select()
      .single()

    if (!error && location) {
      created.site_id = location.id
    }
  } else {
    skipped.push('location')
  }

  // Check and create department
  const { data: existingDepts } = await supabaseAdmin
    .from('departments')
    .select('id')
    .eq('company_id', tenantId)
    .limit(1)

  if (!existingDepts || existingDepts.length === 0) {
    const { data: dept, error } = await supabaseAdmin
      .from('departments')
      .insert({
        company_id: tenantId,
        name: 'Allgemein',
        code: 'ALLG',
        is_active: true
      })
      .select()
      .single()

    if (!error && dept) {
      created.department_id = dept.id
    }
  } else {
    skipped.push('department')
  }

  // Check and create team
  const { data: existingTeams } = await supabaseAdmin
    .from('teams')
    .select('id')
    .eq('company_id', tenantId)
    .limit(1)

  if (!existingTeams || existingTeams.length === 0) {
    const { data: team, error } = await supabaseAdmin
      .from('teams')
      .insert({
        company_id: tenantId,
        name: 'Team 1',
        department_id: created.department_id || existingDepts?.[0]?.id || null
      })
      .select()
      .single()

    if (!error && team) {
      created.team_id = team.id
    }
  } else {
    skipped.push('team')
  }

  const response = { created, skipped, tenant_id: tenantId }

  await logAudit(actorId, 'BOOTSTRAP_ORG', tenantId, null, {}, response, 'success', null, request)

  return { data: response, status: 200 }
}

// GET /tenants/{id}/audit-log - Get audit log for tenant
async function getAuditLog(actorId: string, tenantId: string, url: URL) {
  const limit = parseInt(url.searchParams.get('limit') || '50')
  const offset = parseInt(url.searchParams.get('offset') || '0')
  const action = url.searchParams.get('action')

  let query = supabaseAdmin
    .from('superadmin_audit_log')
    .select('*', { count: 'exact' })
    .eq('target_tenant_id', tenantId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (action) {
    query = query.eq('action', action)
  }

  const { data, error, count } = await query

  if (error) {
    return { error: error.message, status: 500 }
  }

  return { data: { logs: data, total: count, limit, offset }, status: 200 }
}

// GET /audit-log - Get all audit logs (no tenant filter)
async function getAllAuditLogs(actorId: string, url: URL) {
  const limit = parseInt(url.searchParams.get('limit') || '50')
  const offset = parseInt(url.searchParams.get('offset') || '0')
  const action = url.searchParams.get('action')
  const tenantId = url.searchParams.get('tenant_id')

  let query = supabaseAdmin
    .from('superadmin_audit_log')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (action) {
    query = query.eq('action', action)
  }

  if (tenantId) {
    query = query.eq('target_tenant_id', tenantId)
  }

  const { data, error, count } = await query

  if (error) {
    return { error: error.message, status: 500 }
  }

  return { data: { logs: data, total: count, limit, offset }, status: 200 }
}

// =====================================================
// IMPERSONATION ENDPOINTS
// =====================================================

// POST /superadmin/impersonation/start - Start impersonation session
async function startImpersonation(actorId: string, body: any, request: Request) {
  const { tenant_id, user_id, reason, mode } = body

  if (!tenant_id || !user_id || !reason) {
    return { error: 'tenant_id, user_id and reason are required', status: 400 }
  }

  if (reason.length < 10) {
    return { error: 'Reason must be at least 10 characters', status: 400 }
  }

  const validModes = ['view_only', 'act_as']
  const selectedMode = mode || 'view_only'
  if (!validModes.includes(selectedMode)) {
    return { error: `Invalid mode. Must be one of: ${validModes.join(', ')}`, status: 400 }
  }

  console.log('Starting impersonation:', { actorId, tenant_id, user_id, reason, mode: selectedMode })

  // Call the RPC function which handles all validation and creates both sessions
  const { data: result, error } = await supabaseAdmin.rpc('start_impersonation_session', {
    p_target_user_id: user_id,
    p_target_tenant_id: tenant_id,
    p_reason: reason,
    p_mode: selectedMode
  })

  if (error) {
    console.error('Start impersonation RPC error:', error)
    await logAudit(actorId, 'IMPERSONATION_START', tenant_id, user_id, body, null, 'error', error.message, request)
    return { error: error.message, status: 500 }
  }

  console.log('Impersonation RPC result:', result)

  if (!result.success) {
    await logAudit(actorId, 'IMPERSONATION_START', tenant_id, user_id, body, result, 'error', result.message, request)
    
    // Map error codes to HTTP status codes
    const statusMap: Record<string, number> = {
      'not_superadmin': 403,
      'tenant_not_found': 404,
      'user_not_found': 404,
      'user_not_in_tenant': 400
    }
    
    return { 
      error: result.message, 
      error_code: result.error,
      status: statusMap[result.error] || 400 
    }
  }

  await logAudit(actorId, 'IMPERSONATION_START', tenant_id, user_id, body, result, 'success', null, request)

  return { data: result, status: 200 }
}

// POST /superadmin/impersonation/stop - Stop impersonation session
async function stopImpersonation(actorId: string, body: any, request: Request) {
  const { session_id } = body

  console.log('Stopping impersonation:', { actorId, session_id })

  // Call the RPC function
  const { data: result, error } = await supabaseAdmin.rpc('end_impersonation_session', {
    p_session_id: session_id || null
  })

  if (error) {
    console.error('Stop impersonation RPC error:', error)
    await logAudit(actorId, 'IMPERSONATION_STOP', null, null, body, null, 'error', error.message, request)
    return { error: error.message, status: 500 }
  }

  console.log('Stop impersonation RPC result:', result)

  if (!result.success) {
    await logAudit(actorId, 'IMPERSONATION_STOP', null, null, body, result, 'error', result.message, request)
    return { error: result.message, status: 400 }
  }

  await logAudit(actorId, 'IMPERSONATION_STOP', null, null, body, result, 'success', null, request)

  return { data: result, status: 200 }
}

// GET /superadmin/impersonation/status - Get active impersonation session
async function getImpersonationStatus(actorId: string) {
  console.log('Getting impersonation status for:', actorId)

  // Call the RPC function
  const { data: result, error } = await supabaseAdmin.rpc('get_active_impersonation_session')

  if (error) {
    console.error('Get impersonation status RPC error:', error)
    return { error: error.message, status: 500 }
  }

  console.log('Impersonation status result:', result)

  return { data: result, status: 200 }
}

// POST /superadmin/impersonation/extend - Extend impersonation session
async function extendImpersonation(actorId: string, body: any, request: Request) {
  const { session_id, extend_minutes } = body

  console.log('Extending impersonation:', { actorId, session_id, extend_minutes })

  const { data: result, error } = await supabaseAdmin.rpc('extend_impersonation_session', {
    p_session_id: session_id || null,
    p_extend_minutes: extend_minutes || 15
  })

  if (error) {
    console.error('Extend impersonation RPC error:', error)
    await logAudit(actorId, 'IMPERSONATION_EXTEND', null, null, body, null, 'error', error.message, request)
    return { error: error.message, status: 500 }
  }

  if (!result.success) {
    await logAudit(actorId, 'IMPERSONATION_EXTEND', null, null, body, result, 'error', result.message, request)
    return { error: result.message, status: 400 }
  }

  await logAudit(actorId, 'IMPERSONATION_EXTEND', null, null, body, result, 'success', null, request)

  return { data: result, status: 200 }
}

// Main handler
Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const pathParts = url.pathname.split('/').filter(Boolean)
    
    // Remove 'superadmin-api' prefix if present
    if (pathParts[0] === 'superadmin-api') {
      pathParts.shift()
    }

    console.log('Superadmin API request:', req.method, url.pathname, pathParts)

    // Verify superadmin
    const authHeader = req.headers.get('Authorization')
    const { userId, error: authError } = await verifySuperadmin(authHeader)

    if (authError) {
      console.error('Auth error:', authError)
      return new Response(
        JSON.stringify({ error: authError }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    let result: { data?: any; error?: string; status: number }

    // Route handling
    if (req.method === 'POST' && pathParts[0] === 'tenants' && pathParts.length === 1) {
      // POST /tenants - Create tenant
      const body = await req.json()
      result = await createTenant(userId, body, req)
    } 
    else if (req.method === 'POST' && pathParts[0] === 'tenants' && pathParts[2] === 'users' && pathParts[3] === 'invite') {
      // POST /tenants/{id}/users/invite
      const tenantId = pathParts[1]
      const body = await req.json()
      result = await inviteUser(userId, tenantId, body, req)
    }
    else if (req.method === 'POST' && pathParts[0] === 'tenants' && pathParts[2] === 'users' && pathParts[3] === 'create-test') {
      // POST /tenants/{id}/users/create-test
      const tenantId = pathParts[1]
      const body = await req.json()
      result = await createTestUser(userId, tenantId, body, req)
    }
    else if (req.method === 'POST' && pathParts[0] === 'tenants' && pathParts[2] === 'org' && pathParts[3] === 'bootstrap') {
      // POST /tenants/{id}/org/bootstrap
      const tenantId = pathParts[1]
      result = await bootstrapOrg(userId, tenantId, req)
    }
    else if (req.method === 'GET' && pathParts[0] === 'tenants' && pathParts[2] === 'audit-log') {
      // GET /tenants/{id}/audit-log
      const tenantId = pathParts[1]
      result = await getAuditLog(userId, tenantId, url)
    }
    else if (req.method === 'GET' && pathParts[0] === 'audit-log') {
      // GET /audit-log - All audit logs
      result = await getAllAuditLogs(userId, url)
    }
    // =====================================================
    // IMPERSONATION ROUTES
    // =====================================================
    else if (req.method === 'POST' && pathParts[0] === 'superadmin' && pathParts[1] === 'impersonation' && pathParts[2] === 'start') {
      // POST /superadmin/impersonation/start
      const body = await req.json()
      result = await startImpersonation(userId, body, req)
    }
    else if (req.method === 'POST' && pathParts[0] === 'superadmin' && pathParts[1] === 'impersonation' && pathParts[2] === 'stop') {
      // POST /superadmin/impersonation/stop
      const body = await req.json()
      result = await stopImpersonation(userId, body, req)
    }
    else if (req.method === 'GET' && pathParts[0] === 'superadmin' && pathParts[1] === 'impersonation' && pathParts[2] === 'status') {
      // GET /superadmin/impersonation/status
      result = await getImpersonationStatus(userId)
    }
    else if (req.method === 'POST' && pathParts[0] === 'superadmin' && pathParts[1] === 'impersonation' && pathParts[2] === 'extend') {
      // POST /superadmin/impersonation/extend
      const body = await req.json()
      result = await extendImpersonation(userId, body, req)
    }
    else {
      result = { error: 'Not found', status: 404 }
    }

    return new Response(
      JSON.stringify(result.data || { error: result.error }),
      { 
        status: result.status, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error: unknown) {
    console.error('Superadmin API error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
