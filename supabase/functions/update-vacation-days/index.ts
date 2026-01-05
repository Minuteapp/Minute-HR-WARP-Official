import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.48.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AbsenceRequest {
  id: string;
  user_id: string;
  type: string;
  start_date: string;
  end_date: string;
  half_day: boolean;
  status: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { record } = await req.json() as { record: AbsenceRequest };
    
    console.log('Processing absence request:', record);

    // Nur bei Urlaubsanträgen und Statuswechsel zu 'approved'
    if (record.type !== 'vacation' || record.status !== 'approved') {
      console.log('Skipping: Not a vacation request or not approved');
      return new Response('OK', { headers: corsHeaders });
    }

    // Berechne die Anzahl der Urlaubstage
    const startDate = new Date(record.start_date);
    const endDate = new Date(record.end_date);
    const timeDiff = endDate.getTime() - startDate.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24)) + 1;
    const vacationDaysUsed = record.half_day ? daysDiff * 0.5 : daysDiff;

    console.log(`Vacation days to deduct: ${vacationDaysUsed}`);

    // Hole aktuelle Urlaubstage des Mitarbeiters
    const { data: employee, error: employeeError } = await supabaseClient
      .from('employees')
      .select('vacation_days')
      .eq('id', record.user_id)
      .single();

    if (employeeError) {
      console.error('Error fetching employee:', employeeError);
      return new Response(
        JSON.stringify({ error: 'Employee not found' }),
        { status: 404, headers: corsHeaders }
      );
    }

    if (!employee) {
      console.error('Employee not found');
      return new Response(
        JSON.stringify({ error: 'Employee not found' }),
        { status: 404, headers: corsHeaders }
      );
    }

    const currentVacationDays = employee.vacation_days || 0;
    const newVacationDays = Math.max(0, currentVacationDays - vacationDaysUsed);

    console.log(`Current vacation days: ${currentVacationDays}, New vacation days: ${newVacationDays}`);

    // Aktualisiere die Urlaubstage
    const { error: updateError } = await supabaseClient
      .from('employees')
      .update({ vacation_days: newVacationDays })
      .eq('id', record.user_id);

    if (updateError) {
      console.error('Error updating vacation days:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update vacation days' }),
        { status: 500, headers: corsHeaders }
      );
    }

    // Erstelle einen Audit-Log Eintrag
    const { error: auditError } = await supabaseClient
      .from('employee_audit_logs')
      .insert({
        employee_id: record.user_id,
        action_type: 'vacation_days_updated',
        performed_by: record.user_id,
        details: {
          absence_request_id: record.id,
          days_deducted: vacationDaysUsed,
          previous_days: currentVacationDays,
          new_days: newVacationDays,
          reason: 'Approved vacation request'
        }
      });

    if (auditError) {
      console.error('Error creating audit log:', auditError);
      // Nicht kritisch, fahre fort
    }

    console.log(`Successfully updated vacation days for user ${record.user_id}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Vacation days updated successfully',
        daysDeducted: vacationDaysUsed,
        remainingDays: newVacationDays
      }),
      { headers: corsHeaders }
    );

  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: corsHeaders }
    );
  }
});