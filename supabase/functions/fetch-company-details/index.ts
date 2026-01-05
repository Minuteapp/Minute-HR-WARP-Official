
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

Deno.serve(async (req) => {
  // CORS headers für alle Anfragen hinzufügen
  if (req.method === 'OPTIONS') {
    console.log("Edge Function: Handling OPTIONS request");
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Initialisiere Supabase Client mit Service Role
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    console.log("Edge Function: Supabase client initialized with service role");

    // Request Body parsen
    const requestData = await req.json();
    const { companyId } = requestData;
    
    console.log("Request data received:", JSON.stringify(requestData));
    console.log("Edge Function: Fetching company with ID:", companyId);

    // Prüfe auf ungültige company IDs (undefined, null, oder die Strings "undefined"/"null")
    if (!companyId || companyId === 'undefined' || companyId === 'null' || companyId === '') {
      console.log("Edge Function: Invalid or missing company ID provided:", companyId);
      return new Response(
        JSON.stringify({ 
          error: 'Ungültige Firmen-ID',
          details: 'Die angegebene Firmen-ID ist nicht gültig. Bitte überprüfen Sie die URL.',
          provided_id: companyId
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Prüfe ob die ID ein gültiges UUID-Format hat
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(companyId)) {
      console.log("Edge Function: Invalid UUID format:", companyId);
      return new Response(
        JSON.stringify({ 
          error: 'Ungültiges ID-Format',
          details: 'Die Firmen-ID muss im UUID-Format vorliegen.',
          provided_id: companyId
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Fetch company information
    const { data: company, error } = await supabase
      .from('companies')
      .select(`
        id, name, address, tax_id, vat_id, contact_person, billing_email, 
        phone, website, subscription_status, is_active, 
        created_at
      `)
      .eq('id', companyId)
      .single();

    if (error) {
      console.error("Edge Function DB error:", JSON.stringify(error));
      return new Response(
        JSON.stringify({ 
          error: error.message,
          details: error,
          code: error.code
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!company) {
      console.log("Company not found with ID:", companyId);
      return new Response(
        JSON.stringify({ 
          message: 'Firma nicht gefunden',
          details: `Keine Firma mit der ID ${companyId} gefunden`
        }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log("Edge Function: Company found:", company.name);

    // Count employees for this company
    const { count: employeeCount, error: employeeCountError } = await supabase
      .from('employees')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .eq('archived', false);

    if (employeeCountError) {
      console.error("Error counting employees:", JSON.stringify(employeeCountError));
    }

    // Fetch admin invitations for this company
    console.log("Edge Function: Fetching admin_invitations for company_id:", companyId);
    const { data: admins, error: adminsError } = await supabase
      .from('admin_invitations')
      .select('id, email, full_name, phone, position, salutation, status, invitation_sent_at, created_at')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    if (adminsError) {
      console.error("Error fetching admin invitations:", JSON.stringify(adminsError));
    }

    console.log("Edge Function: Admin invitations result - count:", admins?.length || 0, "data:", JSON.stringify(admins));

    // Fetch employees for this company  
    console.log("Edge Function: Fetching employees for company_id:", companyId);
    const { data: employees, error: employeesError } = await supabase
      .from('employees')
      .select('id, first_name, last_name, email, position, department, phone, status, created_at')
      .eq('company_id', companyId)
      .eq('archived', false)
      .order('created_at', { ascending: false });

    if (employeesError) {
      console.error("Error fetching employees:", JSON.stringify(employeesError));
    }

    console.log("Edge Function: Employees result - count:", employees?.length || 0, "data:", JSON.stringify(employees));

    // Add admins, employees and employee_count to company data
    const companyWithAdmins = {
      ...company,
      employee_count: employeeCount || 0,
      admins: admins || [],
      companyAdmins: admins || [],
      employees: employees || []
    };

    console.log("Edge Function: Final response - admins:", (admins || []).length, "employees:", (employees || []).length);

    // Erfolgreiche Antwort mit den erweiterten Firmendaten
    return new Response(
      JSON.stringify(companyWithAdmins),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error: any) {
    console.error('Edge Function error:', error.message, error.stack);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        stack: error.stack,
        details: 'Unexpected error in edge function'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
