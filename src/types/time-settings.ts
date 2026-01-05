export interface WorkingTimeModel {
  id: string;
  name: string;
  type: 'fixed' | 'flextime' | 'trust' | 'shift';
  weeklyHours: number;
  dailyMinHours?: number;
  dailyMaxHours?: number;
  coreTimeStart?: string;
  coreTimeEnd?: string;
  flexTimeBuffer?: number;
  overtimeRules: OvertimeRule;
  pauseRules: PauseRule[];
  applicableTo: EntityReference[];
  createdAt: Date;
  updatedAt: Date;
}

export interface OvertimeRule {
  id: string;
  maxDailyHours: number;
  maxWeeklyHours: number;
  compensationType: 'time_off' | 'payment' | 'mixed';
  paymentMultiplier?: number;
  autoApprovalLimit?: number;
  escalationRules: EscalationRule[];
}

export interface PauseRule {
  id: string;
  minWorkHours: number;
  requiredPauseMinutes: number;
  isAutoEnforced: boolean;
  tolerance?: number;
}

export interface AbsenceType {
  id: string;
  name: string;
  category: 'vacation' | 'sick' | 'special' | 'unpaid';
  color: string;
  icon?: string;
  requiresApproval: boolean;
  requiresDocument: boolean;
  maxDaysPerYear?: number;
  maxConsecutiveDays?: number;
  deductsFromVacation: boolean;
  visibilityLevel: 'public' | 'team' | 'managers' | 'hr';
  notificationEnabled: boolean;
  approvalFlow?: ApprovalFlow;
  blockingRules: BlockingRule[];
  applicableTo: EntityReference[];
}

export interface ApprovalFlow {
  id: string;
  steps: ApprovalStep[];
  escalationRules: EscalationRule[];
  autoApprovalAfterDays?: number;
}

export interface ApprovalStep {
  id: string;
  order: number;
  approverRole: string;
  approverSpecific?: string;
  maxDays: number;
  isRequired: boolean;
  canDelegate: boolean;
}

export interface EscalationRule {
  id: string;
  triggerAfterDays: number;
  escalateTo: string;
  notificationChannels: NotificationChannel[];
  message?: string;
}

export interface BlockingRule {
  id: string;
  type: 'concurrent' | 'seasonal' | 'capacity';
  description: string;
  parameters: Record<string, any>;
}

export interface EntityReference {
  id: string;
  type: 'company' | 'subsidiary' | 'location' | 'department' | 'team' | 'employee';
  name: string;
}

export interface Holiday {
  id: string;
  name: string;
  date: Date;
  isRecurring: boolean;
  location?: EntityReference;
  type: 'public' | 'company' | 'regional';
  substitutionRules?: SubstitutionRule[];
}

export interface SubstitutionRule {
  id: string;
  condition: string;
  substituteDate: Date;
  reason: string;
}

export interface NotificationChannel {
  type: 'email' | 'push' | 'in_app' | 'sms';
  enabled: boolean;
  template?: string;
}

export interface TimePolicy {
  id: string;
  type: 'working_model' | 'absence_type' | 'holiday_rule' | 'overtime_rule' | 'pause_rule' | 'approval_flow';
  title: string;
  description?: string;
  applicableTo: EntityReference[];
  parameters: Record<string, any>;
  effectiveFrom: Date;
  effectiveTo?: Date;
  priority: number;
  createdBy: string;
  isActive: boolean;
}

export interface ComplianceRule {
  id: string;
  type: 'legal' | 'company' | 'custom';
  regulation: string;
  description: string;
  parameters: Record<string, any>;
  jurisdiction: string;
  penalties?: string[];
  checkingRules: CheckingRule[];
}

export interface CheckingRule {
  id: string;
  condition: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  autoCorrection?: boolean;
}

export interface AIConfiguration {
  enabled: boolean;
  modules: {
    patternRecognition: boolean;
    riskAssessment: boolean;
    autoSuggestions: boolean;
    workflowAutomation: boolean;
    complianceMonitoring: boolean;
  };
  thresholds: {
    riskScore: number;
    patternConfidence: number;
    escalationTrigger: number;
  };
  notifications: {
    hrCopilot: boolean;
    proactiveAlerts: boolean;
    weeklyReports: boolean;
  };
}

export interface DashboardMetrics {
  totalPolicies: number;
  activePolicies: number;
  complianceScore: number;
  riskAlerts: number;
  pendingApprovals: number;
  recentChanges: PolicyChange[];
}

export interface PolicyChange {
  id: string;
  policyId: string;
  action: 'created' | 'updated' | 'deleted' | 'activated' | 'deactivated';
  changedBy: string;
  timestamp: Date;
  changes?: Record<string, { old: any; new: any }>;
}