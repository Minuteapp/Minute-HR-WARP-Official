import { useState, useCallback } from 'react';
import { z } from 'zod';

// ============================================
// Zentrale Zod-Schemas für alle kritischen Formulare
// ============================================

export const timeEntrySchema = z.object({
  project_id: z.string().uuid('Bitte wählen Sie ein Projekt').optional(),
  description: z.string().max(500, 'Beschreibung darf maximal 500 Zeichen haben').optional(),
  start_time: z.string().min(1, 'Startzeit ist erforderlich'),
  end_time: z.string().optional(),
  task_id: z.string().uuid().optional().nullable(),
});

export const taskSchema = z.object({
  title: z.string()
    .min(3, 'Titel muss mindestens 3 Zeichen haben')
    .max(200, 'Titel darf maximal 200 Zeichen haben'),
  description: z.string().max(2000, 'Beschreibung darf maximal 2000 Zeichen haben').optional(),
  priority: z.enum(['low', 'medium', 'high'], {
    errorMap: () => ({ message: 'Bitte wählen Sie eine Priorität' })
  }).optional(),
  status: z.enum(['todo', 'in_progress', 'review', 'done']).optional(),
  due_date: z.string().optional().nullable(),
  assignee_id: z.string().uuid().optional().nullable(),
  project_id: z.string().uuid('Bitte wählen Sie ein Projekt').optional().nullable(),
});

export const employeeSchema = z.object({
  first_name: z.string()
    .min(2, 'Vorname muss mindestens 2 Zeichen haben')
    .max(100, 'Vorname darf maximal 100 Zeichen haben'),
  last_name: z.string()
    .min(2, 'Nachname muss mindestens 2 Zeichen haben')
    .max(100, 'Nachname darf maximal 100 Zeichen haben'),
  email: z.string()
    .email('Bitte geben Sie eine gültige E-Mail-Adresse ein')
    .max(255, 'E-Mail darf maximal 255 Zeichen haben'),
  phone: z.string().max(50, 'Telefonnummer darf maximal 50 Zeichen haben').optional().nullable(),
  department_id: z.string().uuid('Bitte wählen Sie eine Abteilung').optional().nullable(),
  position: z.string().max(100, 'Position darf maximal 100 Zeichen haben').optional().nullable(),
  hire_date: z.string().optional().nullable(),
});

export const absenceRequestSchema = z.object({
  type: z.string().min(1, 'Bitte wählen Sie einen Abwesenheitstyp'),
  start_date: z.string().min(1, 'Startdatum ist erforderlich'),
  end_date: z.string().min(1, 'Enddatum ist erforderlich'),
  reason: z.string().max(1000, 'Begründung darf maximal 1000 Zeichen haben').optional(),
  substitute_id: z.string().uuid().optional().nullable(),
}).refine((data) => {
  if (data.start_date && data.end_date) {
    return new Date(data.start_date) <= new Date(data.end_date);
  }
  return true;
}, {
  message: 'Enddatum muss nach oder gleich dem Startdatum sein',
  path: ['end_date'],
});

export const projectSchema = z.object({
  name: z.string()
    .min(3, 'Projektname muss mindestens 3 Zeichen haben')
    .max(200, 'Projektname darf maximal 200 Zeichen haben'),
  description: z.string().max(2000, 'Beschreibung darf maximal 2000 Zeichen haben').optional(),
  start_date: z.string().optional().nullable(),
  end_date: z.string().optional().nullable(),
  status: z.enum(['planning', 'active', 'on_hold', 'completed', 'cancelled']).optional(),
  budget: z.number().min(0, 'Budget muss positiv sein').optional().nullable(),
});

export const departmentSchema = z.object({
  name: z.string()
    .min(2, 'Abteilungsname muss mindestens 2 Zeichen haben')
    .max(100, 'Abteilungsname darf maximal 100 Zeichen haben'),
  description: z.string().max(500, 'Beschreibung darf maximal 500 Zeichen haben').optional(),
  manager_id: z.string().uuid().optional().nullable(),
  parent_id: z.string().uuid().optional().nullable(),
});

// ============================================
// Validation Hook
// ============================================

export interface ValidationResult<T> {
  valid: boolean;
  data?: T;
  errors: Record<string, string>;
  fieldErrors: z.ZodError['errors'] | null;
}

export function useFormValidation<T>(schema: z.Schema<T>) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isValidating, setIsValidating] = useState(false);

  const validate = useCallback((data: unknown): ValidationResult<T> => {
    setIsValidating(true);
    const result = schema.safeParse(data);
    
    if (result.success) {
      setErrors({});
      setIsValidating(false);
      return { 
        valid: true, 
        data: result.data, 
        errors: {},
        fieldErrors: null
      };
    }

    const newErrors: Record<string, string> = {};
    result.error.errors.forEach((err) => {
      const path = err.path.join('.');
      if (path && !newErrors[path]) {
        newErrors[path] = err.message;
      }
    });
    
    setErrors(newErrors);
    setIsValidating(false);
    
    return { 
      valid: false, 
      errors: newErrors,
      fieldErrors: result.error.errors
    };
  }, [schema]);

  const validateField = useCallback((fieldName: string, value: unknown, fullData: unknown): string | null => {
    const result = schema.safeParse(fullData);
    
    if (result.success) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[fieldName];
        return next;
      });
      return null;
    }

    const fieldError = result.error.errors.find(err => err.path.join('.') === fieldName);
    
    if (fieldError) {
      setErrors(prev => ({ ...prev, [fieldName]: fieldError.message }));
      return fieldError.message;
    }
    
    setErrors(prev => {
      const next = { ...prev };
      delete next[fieldName];
      return next;
    });
    return null;
  }, [schema]);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const clearFieldError = useCallback((fieldName: string) => {
    setErrors(prev => {
      const next = { ...prev };
      delete next[fieldName];
      return next;
    });
  }, []);

  const getFieldError = useCallback((fieldName: string): string | undefined => {
    return errors[fieldName];
  }, [errors]);

  const hasErrors = Object.keys(errors).length > 0;

  return {
    validate,
    validateField,
    errors,
    hasErrors,
    isValidating,
    clearErrors,
    clearFieldError,
    getFieldError,
  };
}

// ============================================
// Helper für Error-Display
// ============================================

export const formatValidationError = (error: string): string => {
  return error;
};

export const getFirstError = (errors: Record<string, string>): string | null => {
  const keys = Object.keys(errors);
  return keys.length > 0 ? errors[keys[0]] : null;
};
