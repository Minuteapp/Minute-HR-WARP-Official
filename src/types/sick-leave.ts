
export interface SickLeave {
  id: string;
  user_id: string;
  employee_name?: string;
  department?: string;
  start_date: string;
  end_date?: string;
  description?: string;
  notes?: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  created_at: string;
  updated_at?: string;
  approved_by?: string;
  approved_at?: string;
  rejected_by?: string;
  rejected_at?: string;
  child_name?: string;
  has_contacted_doctor?: boolean;
}

export interface SickLeaveDocument {
  id: string;
  sick_leave_id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  uploaded_at: string;
}

export interface SickLeaveSettings {
  enableAutomaticNotifications: boolean;
  requireDocumentUpload: boolean;
  documentUploadDays: number;
  enableChildSickLeave: boolean;
  enablePartialDaySickLeave: boolean;
  defaultApprovalRequired: boolean;
  notifyManager: boolean;
  notifyHR: boolean;
  notifyColleagues: boolean;
  notificationChannels: string[];
  reminderEnabled: boolean;
  reminderDays: number;
  restrictSensitiveData: boolean;
  dataRetentionMonths: number;
  anonymizeStatistics: boolean;
  showOnlyToAuthorizedUsers: boolean;
}

export interface SickLeaveStatistics {
  totalSickDays: number;
  totalEntries: number;
  averageDuration: number;
  averagePerEmployee: number;
  timelineData: {
    name: string;
    value: number;
  }[];
}

export interface SickLeaveFormData {
  startDate: Date;
  endDate?: Date;
  isPartialDay: boolean;
  startTime?: string;
  endTime?: string;
  reason: string;
  hasContactedDoctor: boolean;
  isChildSickLeave: boolean;
  childName?: string;
  notes?: string;
  confirmAccuracy: boolean;
}
