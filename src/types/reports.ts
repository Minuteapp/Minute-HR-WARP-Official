
export type ReportType = 'monthly' | 'project' | 'expense' | 'travel' | 'custom';
export type ReportStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'archived' | 'deleted';

export interface Report {
  id: string;
  title: string;
  description?: string;
  type: ReportType;
  status: ReportStatus;
  created_by: string;
  assigned_to?: string;
  due_date?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
  archived_at?: string;
  deleted_at?: string;
}

export interface ReportAttachment {
  id: string;
  report_id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  uploaded_by: string;
  uploaded_at: string;
}

export interface ReportComment {
  id: string;
  report_id: string;
  user_id: string;
  comment: string;
  created_at: string;
  updated_at: string;
}

