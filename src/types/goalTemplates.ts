
export type GoalTemplateCategoryType = 'personal' | 'team' | 'company' | 'development' | 'performance';
export type GoalTemplateType = 'smart' | 'okr' | 'development' | 'performance' | 'project';
export type GoalTemplateStatus = 'active' | 'draft' | 'archived';
export type TemplateAccessLevel = 'all' | 'admin' | 'manager' | 'hr';

export interface GoalTemplateField {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'date' | 'select' | 'checkbox' | 'slider';
  required: boolean;
  placeholder?: string;
  description?: string;
  options?: { label: string; value: string }[];
  min?: number;
  max?: number;
  default?: any;
  validation?: {
    pattern?: string;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
  };
}

export interface OKRStructure {
  objective: {
    placeholder: string;
    description?: string;
  };
  keyResults: {
    count: number;
    templates: Array<{
      placeholder: string;
      measurable: boolean;
      target_type: 'percentage' | 'number' | 'boolean';
    }>;
  };
}

export interface KPITemplate {
  name: string;
  description?: string;
  unit: string;
  target_type: 'increase' | 'decrease' | 'maintain';
  benchmark?: number;
  calculation_method?: string;
}

export interface GoalTemplate {
  id: string;
  name: string;
  description?: string;
  category: GoalTemplateCategoryType;
  template_type: GoalTemplateType;
  is_public: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
  usage_count: number;
  status: GoalTemplateStatus;
  metadata: Record<string, any>;
  
  // Template-spezifische Felder
  fields: GoalTemplateField[];
  default_values: Record<string, any>;
  validation_rules: Record<string, any>;
  
  // Berechtigungen
  required_roles: string[];
  access_level: TemplateAccessLevel;
  
  // OKR-spezifische Felder
  okr_structure?: OKRStructure;
  
  // Performance-spezifische Felder
  kpi_templates?: KPITemplate[];
}

export interface GoalTemplateCategory {
  id: string;
  name: string;
  display_name: string;
  description?: string;
  icon?: string;
  color: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface GoalTemplateUsage {
  id: string;
  template_id: string;
  user_id: string;
  goal_id: string;
  used_at: string;
  metadata: Record<string, any>;
}

export interface CreateGoalTemplateRequest {
  name: string;
  description?: string;
  category: GoalTemplateCategoryType;
  template_type: GoalTemplateType;
  is_public?: boolean;
  fields: GoalTemplateField[];
  default_values?: Record<string, any>;
  validation_rules?: Record<string, any>;
  required_roles?: string[];
  access_level?: TemplateAccessLevel;
  okr_structure?: OKRStructure;
  kpi_templates?: KPITemplate[];
  metadata?: Record<string, any>;
}
