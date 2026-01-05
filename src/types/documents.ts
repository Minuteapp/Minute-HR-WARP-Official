
export type DocumentCategory = 'training' | 'recruiting' | 'company' | 'employee' | 'payroll' | 'legal' | 'expenses';
export type DocumentStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'archived' | 'deleted';

// Rechnungsdaten aus KI-Analyse
export interface InvoiceData {
  invoice_number?: string;
  invoice_date?: string;
  total_amount?: number;
  currency?: string;
  vendor_name?: string;
  tax_amount?: number;
}

export interface Document {
  id: string;
  title: string;
  description?: string;
  category: DocumentCategory;
  status: DocumentStatus;
  version: number;
  file_path: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  metadata: Record<string, any>;
  created_by: string;
  updated_by?: string;
  approved_by?: string;
  created_at: string;
  updated_at: string;
  approved_at?: string;
  archived_at?: string;
  deleted_at?: string;
  requires_approval?: boolean;
  approval_status?: string;
  approval_deadline?: string;
  last_viewed_at?: string;
  view_count: number;
  tags: string[];
  expiry_date?: string;
  retention_period?: string;
  encrypted: boolean;
  requires_signature?: boolean;
  signature_status?: string;
  file_type?: string;
  version_number: number;
  is_current_version: boolean;
  visibility_level: string;
  is_template: boolean;
  linked_module?: string;
  employee_id?: string;
  department?: string;
  document_type?: string;
}

export interface DocumentStats {
  totalDocuments: number;
  activeUsers: number;
  recentlyModified: number;
  pendingApprovals: number;
}

export interface DocumentPermission {
  id: string;
  document_id: string;
  user_id: string;
  permission_level: 'view' | 'edit' | 'admin';
  granted_by: string;
  granted_at: string;
  expires_at?: string;
}

export interface DocumentVersion {
  id: string;
  document_id: string;
  version: number;
  file_path: string;
  file_size: number;
  created_by: string;
  created_at: string;
  changes_description?: string;
}

export interface DocumentAccessLog {
  id: string;
  document_id: string;
  user_id: string;
  action: string;
  performed_at: string;
  ip_address?: string;
  user_agent?: string;
}

export const DOCUMENT_CATEGORIES = {
  expenses: 'Ausgaben & Rechnungen',
  training: 'Schulung & Weiterbildung',
  recruiting: 'Recruiting & Onboarding',
  company: 'Unternehmensdokumente',
  employee: 'Mitarbeiterdokumente', 
  payroll: 'Lohn & Gehalt',
  legal: 'Rechtliche Dokumente'
};

export const getDocumentCategoryLabel = (category: DocumentCategory) => 
  DOCUMENT_CATEGORIES[category] || 'Unbekannt';
