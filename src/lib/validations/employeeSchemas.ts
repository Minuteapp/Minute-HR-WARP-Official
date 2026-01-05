import { z } from 'zod';

// Document Upload Schema
export const documentUploadSchema = z.object({
  document_name: z.string().min(1, 'Dokumentname ist erforderlich'),
  document_type: z.enum([
    'contract',
    'payslip',
    'certificate',
    'training',
    'privacy',
    'identification',
    'tax',
    'insurance',
    'other'
  ]),
  category: z.string().optional(),
  is_confidential: z.boolean().default(false),
  expiry_date: z.string().optional(),
  notes: z.string().optional(),
});

export type DocumentUploadFormData = z.infer<typeof documentUploadSchema>;

// Salary Adjustment Schema
export const salaryAdjustmentSchema = z.object({
  gross_salary: z.number().min(0, 'Bruttogehalt muss positiv sein'),
  net_salary: z.number().min(0).optional(),
  bonus_amount: z.number().min(0).default(0),
  effective_date: z.string().min(1, 'Gültigkeitsdatum ist erforderlich'),
  currency: z.string().default('EUR'),
  salary_type: z.enum(['monthly', 'hourly', 'yearly']),
  reason: z.string().optional(),
  notes: z.string().optional(),
});

export type SalaryAdjustmentFormData = z.infer<typeof salaryAdjustmentSchema>;

// Benefit Assignment Schema
export const benefitAssignmentSchema = z.object({
  benefit_name: z.string().min(1, 'Benefit-Name ist erforderlich'),
  benefit_value: z.number().min(0).optional(),
  start_date: z.string().min(1, 'Startdatum ist erforderlich'),
  end_date: z.string().optional(),
  category: z.enum([
    'insurance',
    'pension',
    'car',
    'meal_voucher',
    'transit',
    'gym',
    'phone',
    'laptop',
    'other'
  ]),
  description: z.string().optional(),
  status: z.enum(['active', 'inactive', 'pending']).default('active'),
});

export type BenefitAssignmentFormData = z.infer<typeof benefitAssignmentSchema>;

// Expense Claim Schema
export const expenseClaimSchema = z.object({
  expense_date: z.string().min(1, 'Ausgabedatum ist erforderlich'),
  amount: z.number().min(0.01, 'Betrag muss größer als 0 sein'),
  currency: z.string().default('EUR'),
  category: z.enum([
    'travel',
    'meal',
    'accommodation',
    'equipment',
    'training',
    'office_supplies',
    'entertainment',
    'other'
  ]),
  description: z.string().min(5, 'Beschreibung muss mindestens 5 Zeichen haben'),
  project_id: z.string().optional(),
});

export type ExpenseClaimFormData = z.infer<typeof expenseClaimSchema>;

// Rejection Reason Schema
export const rejectionReasonSchema = z.object({
  reason: z.string().min(10, 'Ablehnungsgrund muss mindestens 10 Zeichen haben'),
});

export type RejectionReasonFormData = z.infer<typeof rejectionReasonSchema>;
