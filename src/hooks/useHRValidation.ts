import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

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

export const useHRValidation = () => {
  const [isValidating, setIsValidating] = useState(false);
  const { toast } = useToast();

  const validateHRData = async (
    dataType: 'employee' | 'absence_request' | 'payroll',
    data: any
  ): Promise<ValidationResult> => {
    setIsValidating(true);
    
    try {
      const { data: result, error } = await supabase.functions.invoke('validate-hr-data', {
        body: {
          data_type: dataType,
          data: data
        }
      });

      if (error) {
        console.error('HR validation error:', error);
        toast({
          variant: "destructive",
          title: "Validierungsfehler",
          description: "Ein Fehler ist bei der Datenvalidierung aufgetreten."
        });
        return {
          isValid: false,
          errors: [{
            field: 'general',
            message: 'Validierung fehlgeschlagen',
            code: 'VALIDATION_ERROR'
          }]
        };
      }

      if (!result.isValid && result.errors.length > 0) {
        toast({
          variant: "destructive",
          title: "Ungültige Daten",
          description: `${result.errors.length} Validierungsfehler gefunden.`
        });
      }

      return result;
    } catch (error: any) {
      console.error('HR validation error:', error);
      toast({
        variant: "destructive",
        title: "Validierungsfehler",
        description: error.message || "Ein unbekannter Fehler ist aufgetreten."
      });
      
      return {
        isValid: false,
        errors: [{
          field: 'general',
          message: 'Validierung fehlgeschlagen',
          code: 'VALIDATION_ERROR'
        }]
      };
    } finally {
      setIsValidating(false);
    }
  };

  const validateEmployee = async (employeeData: any): Promise<ValidationResult> => {
    return validateHRData('employee', employeeData);
  };

  const validateAbsenceRequest = async (absenceData: any): Promise<ValidationResult> => {
    return validateHRData('absence_request', absenceData);
  };

  const validatePayrollData = async (payrollData: any): Promise<ValidationResult> => {
    return validateHRData('payroll', payrollData);
  };

  return {
    validateEmployee,
    validateAbsenceRequest,
    validatePayrollData,
    isValidating
  };
};