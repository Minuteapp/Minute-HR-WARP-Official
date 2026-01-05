
export interface DocumentTemplate {
  id: string;
  name: string;
  description?: string;
  category: string;
  template_type: 'file' | 'form';
  file_path?: string;
  file_name?: string;
  mime_type?: string;
  form_schema?: Record<string, any>;
  metadata_schema?: Record<string, any>;
  placeholders?: TemplatePlaceholder[];
  is_active: boolean;
  requires_signature: boolean;
  access_level: 'all' | 'admin' | 'hr' | 'manager';
  created_by?: string;
  created_at: string;
  updated_at: string;
  version: number;
  parent_template_id?: string;
}

export interface TemplatePlaceholder {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'boolean';
  required: boolean;
  options?: string[];
  default_value?: any;
}

export interface DocumentTemplateInstance {
  id: string;
  template_id: string;
  document_id?: string;
  generated_by?: string;
  form_data?: Record<string, any>;
  placeholder_values?: Record<string, any>;
  signature_data?: Record<string, any>;
  status: 'draft' | 'pending_signature' | 'completed';
  created_at: string;
  completed_at?: string;
}

export interface DocumentTemplateCategory {
  id: string;
  category_key: string;
  display_name: string;
  description?: string;
  icon?: string;
  color: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface TemplateFormField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'email' | 'date' | 'select' | 'textarea' | 'checkbox';
  required: boolean;
  placeholder?: string;
  options?: { label: string; value: string }[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

export interface TemplateFormSchema {
  title: string;
  description?: string;
  fields: TemplateFormField[];
}
