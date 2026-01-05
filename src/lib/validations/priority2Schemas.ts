import { z } from 'zod';

// Project Schema
export const projectSchema = z.object({
  project_name: z.string().min(3, 'Projektname muss mindestens 3 Zeichen haben'),
  description: z.string().optional(),
  status: z.enum(['planning', 'active', 'completed', 'on_hold', 'cancelled']).default('planning'),
  priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  deadline: z.string().optional(),
  budget_total: z.number().min(0).optional(),
  project_lead_id: z.string().optional(),
  department: z.string().optional(),
  client_name: z.string().optional(),
});

export type ProjectFormData = z.infer<typeof projectSchema>;

// Task Schema
export const taskSchema = z.object({
  title: z.string().min(3, 'Titel muss mindestens 3 Zeichen haben'),
  description: z.string().optional(),
  status: z.enum(['pending', 'in_progress', 'review', 'completed', 'cancelled']).default('pending'),
  priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  project_id: z.string().optional(),
  assigned_to: z.string().optional(),
  due_date: z.string().optional(),
  estimated_hours: z.number().min(0).optional(),
  tags: z.array(z.string()).optional(),
});

export type TaskFormData = z.infer<typeof taskSchema>;

// Goal Schema
export const goalSchema = z.object({
  goal_title: z.string().min(3, 'Titel muss mindestens 3 Zeichen haben'),
  description: z.string().optional(),
  category: z.enum(['personal', 'team', 'company', 'skill', 'performance', 'development']).default('personal'),
  type: z.enum(['okr', 'kpi', 'smart', 'general']).default('general'),
  target_value: z.number().min(0).optional(),
  unit: z.string().optional(),
  target_date: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
});

export type GoalFormData = z.infer<typeof goalSchema>;

// Milestone Schema
export const milestoneSchema = z.object({
  milestone_title: z.string().min(3, 'Titel muss mindestens 3 Zeichen haben'),
  description: z.string().optional(),
  target_date: z.string().optional(),
});

export type MilestoneFormData = z.infer<typeof milestoneSchema>;

// Sick Leave Schema
export const sickLeaveSchema = z.object({
  start_date: z.string().min(1, 'Startdatum ist erforderlich'),
  end_date: z.string().optional(),
  is_partial_day: z.boolean().default(false),
  start_time: z.string().optional(),
  end_time: z.string().optional(),
  reason: z.string().optional(),
  diagnosis_category: z.enum(['common_cold', 'flu', 'injury', 'surgery', 'mental_health', 'chronic', 'other']).optional(),
  is_work_related: z.boolean().default(false),
  is_child_sick_leave: z.boolean().default(false),
  child_name: z.string().optional(),
  has_contacted_doctor: z.boolean().default(false),
  doctor_contact_date: z.string().optional(),
  notes: z.string().optional(),
});

export type SickLeaveFormData = z.infer<typeof sickLeaveSchema>;
