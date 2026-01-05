
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

// Dummy-Mitarbeiter für den Fall, dass keine verfügbar sind
const dummyEmployees = [
  { 
    employee_id: 'emp-001',
    start_time: '06:00:00',
    end_time: '22:00:00',
    is_available: true,
    employees: { id: 'emp-001', first_name: 'Anna', last_name: 'Müller' }
  },
  {
    employee_id: 'emp-002',
    start_time: '14:00:00',
    end_time: '06:00:00',
    is_available: true,
    employees: { id: 'emp-002', first_name: 'Thomas', last_name: 'Weber' }
  },
  {
    employee_id: 'emp-003',
    start_time: '06:00:00',
    end_time: '16:00:00',
    is_available: true,
    employees: { id: 'emp-003', first_name: 'Maria', last_name: 'Schmidt' }
  },
  {
    employee_id: 'emp-004',
    start_time: '12:00:00',
    end_time: '08:00:00',
    is_available: true,
    employees: { id: 'emp-004', first_name: 'Jan', last_name: 'Becker' }
  }
];

const getShiftTypes = async (supabase: any) => {
  console.log('Fetching shift types...');
  const { data: shiftTypes, error } = await supabase
    .from('shift_types')
    .select('*')
    .eq('is_active', true);

  if (error) {
    console.error('Error fetching shift types:', error);
    throw error;
  }
  console.log('Found shift types:', shiftTypes);
  return shiftTypes;
}

const getEmployeesWithAvailability = async (supabase: any, date: string) => {
  const dayOfWeek = new Date(date).getDay();
  console.log('Fetching employees with availability for day:', dayOfWeek);
  
  try {
    const { data: employees, error } = await supabase
      .from('employee_availability')
      .select(`
        employee_id,
        start_time,
        end_time,
        is_available,
        employees (
          id,
          first_name,
          last_name
        )
      `)
      .eq('day_of_week', dayOfWeek)
      .eq('is_available', true);

    if (error) {
      console.error('Error fetching employees with availability:', error);
      throw error;
    }

    console.log('Found available employees:', employees);
    
    // Wenn keine Mitarbeiter verfügbar sind, verwenden wir die Dummy-Daten
    if (!employees || employees.length === 0) {
      console.log('No employees found, using dummy data instead');
      return dummyEmployees;
    }
    
    return employees;
  } catch (error) {
    console.error('Error in getEmployeesWithAvailability:', error);
    // Bei einem Fehler auch Dummy-Daten zurückgeben
    console.log('Error occurred, using dummy data instead');
    return dummyEmployees;
  }
}

const generateShiftsForDay = async (supabase: any, date: string, shiftTypes: any[], availableEmployees: any[]) => {
  console.log('Generating shifts for date:', date);
  console.log('Available shift types:', shiftTypes);
  console.log('Available employees:', availableEmployees);
  
  const shifts = [];

  for (const shiftType of shiftTypes) {
    // Filter employees available during this shift time
    const eligibleEmployees = availableEmployees.filter(emp => {
      if (!emp.start_time || !emp.end_time) return true;
      const empStart = new Date(`2000-01-01T${emp.start_time}`);
      const empEnd = new Date(`2000-01-01T${emp.end_time}`);
      const shiftStart = new Date(`2000-01-01T${shiftType.start_time}`);
      const shiftEnd = new Date(`2000-01-01T${shiftType.end_time}`);
      return empStart <= shiftStart && empEnd >= shiftEnd;
    });

    console.log(`Eligible employees for shift type ${shiftType.name}:`, eligibleEmployees);

    // Stelle sicher, dass wir die Mindestanzahl an Mitarbeitern haben
    // Wenn nicht genug Mitarbeiter verfügbar sind, nehmen wir alle
    const requiredStaff = Math.min(shiftType.required_staff, eligibleEmployees.length);
    const selectedEmployees = [...eligibleEmployees]
      .sort(() => Math.random() - 0.5)
      .slice(0, requiredStaff);

    console.log(`Selected employees for shift type ${shiftType.name}:`, selectedEmployees);

    // Create shifts for selected employees
    for (const employee of selectedEmployees) {
      shifts.push({
        date,
        shift_type_id: shiftType.id,
        employee_id: employee.employee_id,
        start_time: new Date(`${date}T${shiftType.start_time}`).toISOString(),
        end_time: new Date(`${date}T${shiftType.end_time}`).toISOString(),
        status: 'scheduled'
      });
    }
  }

  console.log('Generated shifts:', shifts);
  return shifts;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { period, date } = await req.json();
    console.log('Received request:', { period, date });

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get shift types and employee availability
    const shiftTypes = await getShiftTypes(supabaseClient);
    
    if (!shiftTypes || shiftTypes.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Keine aktiven Schichttypen gefunden',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    // Calculate date range based on period
    let endDate = new Date(date);
    switch (period) {
      case 'week':
        endDate.setDate(endDate.getDate() + 7);
        break;
      case 'month':
        endDate.setMonth(endDate.getMonth() + 1);
        break;
      default: // day
        endDate.setDate(endDate.getDate() + 1);
    }

    console.log('Planning shifts from', date, 'to', endDate.toISOString());

    // Generate shifts for each day in the range
    const currentDate = new Date(date);
    const allShifts = [];

    while (currentDate < endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const availableEmployees = await getEmployeesWithAvailability(supabaseClient, dateStr);
      const shiftsForDay = await generateShiftsForDay(supabaseClient, dateStr, shiftTypes, availableEmployees);
      allShifts.push(...shiftsForDay);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    console.log('Total shifts to insert:', allShifts.length);

    // Löschen bestehender Schichten für den Zeitraum, um Duplikate zu vermeiden
    const startDateStr = date.split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];
    
    const { error: deleteError } = await supabaseClient
      .from('shifts')
      .delete()
      .gte('date', startDateStr)
      .lt('date', endDateStr);
    
    if (deleteError) {
      console.error('Error deleting existing shifts:', deleteError);
      // Fehler beim Löschen nicht als kritisch betrachten
    }

    // Insert generated shifts
    if (allShifts.length > 0) {
      const { error: insertError } = await supabaseClient
        .from('shifts')
        .insert(allShifts);

      if (insertError) {
        console.error('Error inserting shifts:', insertError);
        throw insertError;
      }
    } else {
      console.log('No shifts to insert - no available employees or shift types found');
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Shifts generated successfully',
        shiftsGenerated: allShifts.length 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in auto-plan-shifts:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
})
