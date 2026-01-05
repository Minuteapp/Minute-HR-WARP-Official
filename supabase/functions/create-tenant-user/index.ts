import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CreateUserRequest {
  email: string;
  fullName: string;
  password: string;
  role: string;
  companyId: string;
  isTestUser?: boolean;
  department?: string;
  team?: string;
  position?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  console.log("🚀 create-tenant-user: Request received");

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    // Create admin client with service role key
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Verify the calling user is a superadmin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("❌ No authorization header");
      return new Response(
        JSON.stringify({ error: "Nicht autorisiert", code: "NO_AUTH_HEADER" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user: callingUser }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !callingUser) {
      console.error("❌ Auth error:", authError?.message);
      return new Response(
        JSON.stringify({ error: "Nicht autorisiert", code: "AUTH_ERROR", details: authError?.message }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("👤 Calling user:", callingUser.email);

    // Check if calling user is superadmin
    const { data: callerRole, error: roleCheckError } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", callingUser.id)
      .single();

    if (roleCheckError) {
      console.error("❌ Role check error:", roleCheckError.message);
    }

    if (!callerRole || callerRole.role !== "superadmin") {
      console.error("❌ User is not superadmin:", callerRole?.role);
      return new Response(
        JSON.stringify({ error: "Nur Superadmins können Nutzer erstellen", code: "NOT_SUPERADMIN" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("✅ Superadmin verified");

    // Parse request body
    const body: CreateUserRequest = await req.json();
    const { email, fullName, password, role, companyId, isTestUser, department, team, position } = body;

    console.log("📝 Request body:", { email, fullName, role, companyId, isTestUser, department, team, position });

    if (!email || !password || !companyId) {
      console.error("❌ Missing required fields");
      return new Response(
        JSON.stringify({ error: "E-Mail, Passwort und Company ID sind erforderlich", code: "MISSING_FIELDS" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify company exists
    const { data: company, error: companyError } = await supabaseAdmin
      .from("companies")
      .select("id, name")
      .eq("id", companyId)
      .single();

    if (companyError || !company) {
      console.error("❌ Company not found:", companyId, companyError?.message);
      return new Response(
        JSON.stringify({ error: "Firma nicht gefunden", code: "COMPANY_NOT_FOUND" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("🏢 Company verified:", company.name);

    // Try to create user directly - Supabase will return error if email exists
    console.log("📧 Creating auth user...");
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        company_id: companyId,
        is_test_user: isTestUser || false
      }
    });

    // Normalize email for consistent lookups
    const normalizedEmail = email.trim().toLowerCase();

    // Handle "user already exists" case
    if (createError) {
      const errorMessage = createError.message.toLowerCase();
      
      // If user already exists, try to repair tenant records
      if (errorMessage.includes('already') || errorMessage.includes('duplicate') || errorMessage.includes('exists')) {
        console.log("ℹ️ User already exists in Auth, attempting to find and link to tenant...");
        
        // Use DB function to find user ID by email (reliable, case-insensitive)
        const { data: existingUserId, error: lookupError } = await supabaseAdmin
          .rpc("get_user_id_by_email", { p_email: normalizedEmail });
        
        if (lookupError || !existingUserId) {
          console.error("❌ Could not find existing user by email:", lookupError?.message);
          return new Response(
            JSON.stringify({ 
              error: "Nutzer existiert im Auth-System, konnte aber nicht gefunden werden. Bitte Support kontaktieren.", 
              code: "USER_LOOKUP_FAILED",
              details: lookupError?.message
            }),
            { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        console.log("✅ Found existing auth user:", existingUserId);

        // Check if user is already in a different company
        const { data: existingEmployee } = await supabaseAdmin
          .from("employees")
          .select("user_id, company_id, name")
          .eq("user_id", existingUserId)
          .single();

        if (existingEmployee && existingEmployee.company_id && existingEmployee.company_id !== companyId) {
          console.error("❌ User already exists in different company:", normalizedEmail, existingEmployee.company_id);
          return new Response(
            JSON.stringify({ error: "Ein Nutzer mit dieser E-Mail existiert bereits in einer anderen Firma", code: "USER_EXISTS_OTHER_COMPANY" }),
            { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Repair/link the user to this tenant
        console.log("🔧 Repairing tenant records for existing user...");

        // UPSERT profile
        const { error: profileUpsertError } = await supabaseAdmin
          .from("profiles")
          .upsert({
            id: existingUserId,
            full_name: fullName,
            company_id: companyId,
            is_test_user: isTestUser || false,
            updated_at: new Date().toISOString()
          }, { onConflict: 'id' });

        if (profileUpsertError) {
          console.error("⚠️ Error upserting profile:", profileUpsertError.message);
        } else {
          console.log("✅ Profile upserted");
        }

        // UPSERT user_role
        const { error: roleUpsertError } = await supabaseAdmin
          .from("user_roles")
          .upsert({
            user_id: existingUserId,
            role: role || "employee",
            company_id: companyId
          }, { onConflict: 'user_id' });

        if (roleUpsertError) {
          console.error("⚠️ Error upserting user role:", roleUpsertError.message);
        } else {
          console.log("✅ User role upserted");
        }

        // UPSERT employee
        const nameParts = (fullName || '').split(' ');
        const firstName = nameParts[0] || 'Nutzer';
        const lastName = nameParts.slice(1).join(' ') || '';

        const { error: employeeUpsertError } = await supabaseAdmin
          .from("employees")
          .upsert({
            user_id: existingUserId,
            company_id: companyId,
            name: fullName || normalizedEmail,
            first_name: firstName,
            last_name: lastName,
            email: normalizedEmail,
            position: position || (isTestUser ? 'Test-Nutzer' : 'Mitarbeiter'),
            department: department || null,
            team: team || null,
            status: 'active',
            archived: false,
            is_test_user: isTestUser || false,
            created_by_superadmin: callingUser.id
          }, { onConflict: 'user_id' });

        if (employeeUpsertError) {
          console.error("⚠️ Error upserting employee:", employeeUpsertError.message);
        } else {
          console.log("✅ Employee record upserted");
        }

        const duration = Date.now() - startTime;
        console.log(`🎉 create-tenant-user (repair mode) completed in ${duration}ms`);

        return new Response(
          JSON.stringify({
            success: true,
            userId: existingUserId,
            email: normalizedEmail,
            role: role,
            companyId: companyId,
            companyName: company.name,
            isTestUser: isTestUser || false,
            repaired: true,
            message: `Nutzer "${fullName}" wurde erfolgreich mit "${company.name}" verknüpft`
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Other creation errors
      console.error("❌ Error creating auth user:", createError.message);
      return new Response(
        JSON.stringify({ error: createError.message, code: "AUTH_CREATE_ERROR" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // User was created successfully
    console.log("✅ Auth user created:", newUser!.user.id);

    // Create profile with company_id
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .upsert({
        id: newUser.user.id,
        full_name: fullName,
        company_id: companyId,
        is_test_user: isTestUser || false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (profileError) {
      console.error("⚠️ Error creating profile:", profileError.message);
      // Profile is critical - if it fails, we should report it
      return new Response(
        JSON.stringify({ 
          error: "Profil konnte nicht erstellt werden: " + profileError.message, 
          code: "PROFILE_ERROR",
          userId: newUser.user.id
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    console.log("✅ Profile created with company_id");

    // Create user_role with company_id
    const { error: roleError } = await supabaseAdmin
      .from("user_roles")
      .upsert({
        user_id: newUser.user.id,
        role: role || "employee",
        company_id: companyId
      }, {
        onConflict: 'user_id'
      });

    if (roleError) {
      console.error("⚠️ Error creating user role:", roleError.message);
      return new Response(
        JSON.stringify({ 
          error: "Nutzer erstellt, aber Rolle konnte nicht zugewiesen werden", 
          code: "ROLE_ERROR",
          userId: newUser.user.id
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("✅ User role created:", role);

    // Create employee entry
    const nameParts = (fullName || '').split(' ');
    const firstName = nameParts[0] || 'Test';
    const lastName = nameParts.slice(1).join(' ') || 'Nutzer';

    const displayName = (fullName || `${firstName} ${lastName}` || email).trim();

    const { error: employeeError } = await supabaseAdmin
      .from("employees")
      .upsert({
        user_id: newUser.user.id,
        company_id: companyId,
        name: displayName,
        first_name: firstName,
        last_name: lastName,
        email: email,
        position: position || (isTestUser ? 'Test-Nutzer' : 'Mitarbeiter'),
        department: department || null,
        team: team || null,
        status: 'active',
        archived: false,
        is_test_user: isTestUser || false,
        created_by_superadmin: callingUser.id
      }, {
        onConflict: 'user_id'
      });

    if (employeeError) {
      console.error("⚠️ Error creating employee (non-fatal):", employeeError.message);
    } else {
      console.log("✅ Employee record created");
    }

    // Log audit trail in audit_logs table (not impersonation_audit_logs which requires session_id)
    const { error: auditError } = await supabaseAdmin
      .from("audit_logs")
      .insert({
        company_id: companyId,
        user_id: callingUser.id,
        action: 'CREATE_TENANT_USER',
        table_name: 'users',
        record_id: newUser.user.id,
        new_values: {
          email,
          fullName,
          role,
          companyId,
          isTestUser,
          department,
          team,
          position
        }
      });

    if (auditError) {
      console.error("⚠️ Error logging audit (non-fatal):", auditError.message);
    } else {
      console.log("✅ Audit log created");
    }

    const duration = Date.now() - startTime;
    console.log(`🎉 create-tenant-user completed in ${duration}ms`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        userId: newUser.user.id,
        email: email,
        role: role,
        companyId: companyId,
        companyName: company.name,
        isTestUser: isTestUser || false,
        message: `Nutzer "${fullName}" erfolgreich in "${company.name}" erstellt`
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("❌ Unexpected error:", error);
    return new Response(
      JSON.stringify({ 
        error: "Unerwarteter Fehler", 
        code: "UNEXPECTED_ERROR",
        details: error instanceof Error ? error.message : String(error)
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
