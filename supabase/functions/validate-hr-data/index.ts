import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ValidationError {
  field: string;
  message: string;
  code: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  sanitizedData?: any;
}

// HR Data Validation Functions
const validateEmployee = (data: any): ValidationResult => {
  const errors: ValidationError[] = [];
  
  // Name validation
  if (!data.name || typeof data.name !== 'string' || data.name.trim().length < 2) {
    errors.push({
      field: 'name',
      message: 'Name muss mindestens 2 Zeichen lang sein',
      code: 'INVALID_NAME'
    });
  }
  
  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.email || !emailRegex.test(data.email)) {
    errors.push({
      field: 'email',
      message: 'Ungültige E-Mail-Adresse',
      code: 'INVALID_EMAIL'
    });
  }
  
  // Employee number validation
  if (!data.employee_number || data.employee_number.length < 3) {
    errors.push({
      field: 'employee_number',
      message: 'Mitarbeiternummer muss mindestens 3 Zeichen lang sein',
      code: 'INVALID_EMPLOYEE_NUMBER'
    });
  }
  
  // Employment type validation
  const validEmploymentTypes = ['full_time', 'part_time', 'contract', 'intern', 'freelancer'];
  if (!data.employment_type || !validEmploymentTypes.includes(data.employment_type)) {
    errors.push({
      field: 'employment_type',
      message: 'Ungültiger Beschäftigungstyp',
      code: 'INVALID_EMPLOYMENT_TYPE'
    });
  }
  
  // Start date validation
  if (!data.start_date || isNaN(Date.parse(data.start_date))) {
    errors.push({
      field: 'start_date',
      message: 'Ungültiges Startdatum',
      code: 'INVALID_START_DATE'
    });
  } else {
    const startDate = new Date(data.start_date);
    const today = new Date();
    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(today.getFullYear() + 1);
    
    if (startDate > oneYearFromNow) {
      errors.push({
        field: 'start_date',
        message: 'Startdatum darf nicht mehr als ein Jahr in der Zukunft liegen',
        code: 'FUTURE_START_DATE'
      });
    }
  }
  
  // Sanitize data
  const sanitizedData = {
    ...data,
    name: data.name?.trim(),
    email: data.email?.toLowerCase().trim(),
    first_name: data.first_name?.trim(),
    last_name: data.last_name?.trim(),
    employee_number: data.employee_number?.trim(),
    department: data.department?.trim(),
    position: data.position?.trim(),
    team: data.team?.trim()
  };
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitizedData: errors.length === 0 ? sanitizedData : undefined
  };
};

const validateAbsenceRequest = (data: any): ValidationResult => {
  const errors: ValidationError[] = [];
  
  // Date validation
  if (!data.start_date || isNaN(Date.parse(data.start_date))) {
    errors.push({
      field: 'start_date',
      message: 'Ungültiges Startdatum',
      code: 'INVALID_START_DATE'
    });
  }
  
  if (!data.end_date || isNaN(Date.parse(data.end_date))) {
    errors.push({
      field: 'end_date',
      message: 'Ungültiges Enddatum',
      code: 'INVALID_END_DATE'
    });
  }
  
  // Check if end date is after start date
  if (data.start_date && data.end_date) {
    const startDate = new Date(data.start_date);
    const endDate = new Date(data.end_date);
    
    if (endDate < startDate) {
      errors.push({
        field: 'end_date',
        message: 'Enddatum muss nach dem Startdatum liegen',
        code: 'INVALID_DATE_RANGE'
      });
    }
    
    // Check if dates are not too far in the future (max 2 years)
    const twoYearsFromNow = new Date();
    twoYearsFromNow.setFullYear(twoYearsFromNow.getFullYear() + 2);
    
    if (startDate > twoYearsFromNow) {
      errors.push({
        field: 'start_date',
        message: 'Startdatum darf nicht mehr als 2 Jahre in der Zukunft liegen',
        code: 'DATE_TOO_FAR_FUTURE'
      });
    }
  }
  
  // Type validation
  const validAbsenceTypes = ['vacation', 'sick', 'personal', 'training', 'other'];
  if (!data.type || !validAbsenceTypes.includes(data.type)) {
    errors.push({
      field: 'type',
      message: 'Ungültiger Abwesenheitstyp',
      code: 'INVALID_ABSENCE_TYPE'
    });
  }
  
  // Reason validation for certain types
  if ((data.type === 'personal' || data.type === 'other') && (!data.reason || data.reason.trim().length < 5)) {
    errors.push({
      field: 'reason',
      message: 'Grund muss für diesen Abwesenheitstyp angegeben werden (mindestens 5 Zeichen)',
      code: 'REASON_REQUIRED'
    });
  }
  
  // Time validation for half days
  if (data.half_day && (!data.start_time || !data.end_time)) {
    errors.push({
      field: 'time',
      message: 'Für halbe Tage müssen Start- und Endzeit angegeben werden',
      code: 'TIME_REQUIRED_FOR_HALF_DAY'
    });
  }
  
  const sanitizedData = {
    ...data,
    reason: data.reason?.trim(),
    employee_name: data.employee_name?.trim()
  };
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitizedData: errors.length === 0 ? sanitizedData : undefined
  };
};

const validatePayrollData = (data: any): ValidationResult => {
  const errors: ValidationError[] = [];
  
  // User ID validation
  if (!data.user_id) {
    errors.push({
      field: 'user_id',
      message: 'Benutzer-ID ist erforderlich',
      code: 'USER_ID_REQUIRED'
    });
  }
  
  // Salary validation
  if (data.base_salary !== undefined) {
    if (isNaN(data.base_salary) || data.base_salary < 0) {
      errors.push({
        field: 'base_salary',
        message: 'Grundgehalt muss eine positive Zahl sein',
        code: 'INVALID_SALARY'
      });
    }
    
    if (data.base_salary > 1000000) {
      errors.push({
        field: 'base_salary',
        message: 'Grundgehalt scheint unrealistisch hoch zu sein',
        code: 'SALARY_TOO_HIGH'
      });
    }
  }
  
  // Hours validation
  if (data.working_hours_per_week !== undefined) {
    if (isNaN(data.working_hours_per_week) || data.working_hours_per_week < 0 || data.working_hours_per_week > 80) {
      errors.push({
        field: 'working_hours_per_week',
        message: 'Wochenarbeitszeit muss zwischen 0 und 80 Stunden liegen',
        code: 'INVALID_WORKING_HOURS'
      });
    }
  }
  
  // Contract type validation
  const validContractTypes = ['full_time', 'part_time', 'freelancer', 'intern', 'minijob'];
  if (data.contract_type && !validContractTypes.includes(data.contract_type)) {
    errors.push({
      field: 'contract_type',
      message: 'Ungültiger Vertragstyp',
      code: 'INVALID_CONTRACT_TYPE'
    });
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitizedData: errors.length === 0 ? data : undefined
  };
};

const logValidationFailure = async (supabase: any, userId: string | null, dataType: string, errors: ValidationError[], submittedData: any, ipAddress: string | null) => {
  try {
    await supabase
      .from('hr_validation_logs')
      .insert({
        user_id: userId,
        data_type: dataType,
        validation_errors: errors,
        submitted_data: submittedData,
        ip_address: ipAddress
      });
  } catch (error) {
    console.error('Failed to log validation failure:', error);
  }
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data_type, data } = await req.json();
    
    // Get user info from auth header
    const authHeader = req.headers.get('authorization');
    let userId: string | null = null;
    
    if (authHeader) {
      try {
        const { data: { user } } = await supabaseClient.auth.getUser(authHeader.replace('Bearer ', ''));
        userId = user?.id || null;
      } catch (error) {
        console.log('Could not get user from auth header:', error);
      }
    }
    
    // Get IP address
    const ipAddress = req.headers.get('x-forwarded-for') || 
                     req.headers.get('x-real-ip') || 
                     'unknown';

    let validationResult: ValidationResult;

    // Validate based on data type
    switch (data_type) {
      case 'employee':
        validationResult = validateEmployee(data);
        break;
      case 'absence_request':
        validationResult = validateAbsenceRequest(data);
        break;
      case 'payroll':
        validationResult = validatePayrollData(data);
        break;
      default:
        return new Response(
          JSON.stringify({ 
            error: 'Ungültiger Datentyp. Unterstützte Typen: employee, absence_request, payroll' 
          }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
    }

    // Log validation failure if there are errors
    if (!validationResult.isValid) {
      await logValidationFailure(
        supabaseClient, 
        userId, 
        data_type, 
        validationResult.errors, 
        data, 
        ipAddress
      );
    }

    return new Response(
      JSON.stringify({
        isValid: validationResult.isValid,
        errors: validationResult.errors,
        sanitizedData: validationResult.sanitizedData
      }),
      {
        status: validationResult.isValid ? 200 : 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in validate-hr-data function:', error);
    return new Response(
      JSON.stringify({ error: 'Interner Serverfehler bei der Datenvalidierung' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});