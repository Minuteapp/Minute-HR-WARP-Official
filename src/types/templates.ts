
export interface UniversalTemplate {
  id: string;
  name: string;
  description?: string;
  category: 'documents' | 'goals' | 'performance' | 'budget' | 'payroll' | 'training' | 'recruiting' | 'custom';
  template_type: string;
  content: any;
  file_path?: string;
  file_name?: string;
  mime_type?: string;
  file_size?: number;
  placeholders: TemplatePlaceholder[];
  is_active: boolean;
  is_system_template: boolean;
  access_level: 'all' | 'admin' | 'manager' | 'hr';
  usage_count: number;
  version: number;
  parent_template_id?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  last_used_at?: string;
  languages: string[];
  permissions: TemplatePermission[];
  tags?: string[];
  rating?: number;
  feedback_count?: number;
}

export interface TemplatePlaceholder {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'boolean' | 'textarea' | 'email' | 'phone';
  required: boolean;
  options?: string[];
  default_value?: any;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

export interface TemplatePermission {
  role: string;
  can_view: boolean;
  can_edit: boolean;
  can_use: boolean;
  can_upload: boolean;
  can_approve: boolean;
}

export interface TemplateVersion {
  id: string;
  template_id: string;
  version_number: number;
  changes_summary?: string;
  content_snapshot: any;
  created_by?: string;
  created_at: string;
}

export interface TemplateUsage {
  id: string;
  template_id: string;
  user_id: string;
  used_in_module: string;
  usage_data: any;
  used_at: string;
}

export interface TemplateCategory {
  id: string;
  name: string;
  display_name: string;
  description?: string;
  icon: string;
  color: string;
  sort_order: number;
  is_active: boolean;
}

export interface CreateTemplateRequest {
  name: string;
  description?: string;
  category: 'documents' | 'goals' | 'performance' | 'budget' | 'payroll' | 'training' | 'recruiting' | 'custom';
  template_type: string;
  content?: any;
  placeholders?: TemplatePlaceholder[];
  access_level?: 'all' | 'admin' | 'manager' | 'hr';
  languages?: string[];
  tags?: string[];
}

export interface TemplateUpload {
  file: File;
  name: string;
  description?: string;
  category: string;
  placeholders?: TemplatePlaceholder[];
}

export interface TemplatePreview {
  id: string;
  preview_url?: string;
  preview_content?: string;
  thumbnail?: string;
}

export interface TemplateFeedback {
  id: string;
  template_id: string;
  user_id: string;
  rating: number;
  comment?: string;
  created_at: string;
}

// Spezifische Template-Typen für Legacy-Kompatibilität
export interface DocumentTemplate extends UniversalTemplate {
  category: 'documents';
}

export interface GoalTemplate extends UniversalTemplate {
  category: 'goals';
}

export interface PerformanceTemplate extends UniversalTemplate {
  category: 'performance';
}

export interface BudgetTemplate extends UniversalTemplate {
  category: 'budget';
}
