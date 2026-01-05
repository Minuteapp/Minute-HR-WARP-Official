
export interface ProjectFormData {
  name: string;
  description?: string;
  status?: string;
  priority?: string;
  start_date?: string;
  end_date?: string;
  startDate?: string;
  dueDate?: string;
  budget?: number | string;
  currency?: string;
  project_type?: string;
  costCenter?: string;
  category?: string;
  responsiblePerson?: string;
  tags?: any[];
  team?: any[];
  tasks?: any[];
  milestones?: any[];
  goals?: any[];
  taskView?: string;
  enableTimeTracking?: boolean;
  useTaskTemplate?: string;
  enableNotifications?: boolean;
  integrateExternalTools?: boolean;
  saveAsTemplate?: boolean;
  progress?: number;
  templateId?: string;
  requiresApproval?: boolean;
  riskAssessment?: any;
  resourceAllocation?: any;
  stakeholders?: any[];
  
  // Erweiterte finanzielle Felder
  capexAmount?: number;
  opexAmount?: number;
  expectedRevenue?: number;
  discountRate?: number;
  enableFinancialCalculations?: boolean;
  investmentType?: 'CAPEX' | 'OPEX' | 'MIXED';
  roiPercentage?: number;
  npvValue?: number;
  irrPercentage?: number;
  
  // Compliance & Risiko
  complianceRequired?: boolean;
  riskLevel?: 'low' | 'medium' | 'high';
  complianceNotes?: string;
  
  // Dokumentation & Dateien
  attachments?: any[];
  documentationRequired?: boolean;
  
  // Automatisierung
  enableAutomatedReporting?: boolean;
  reportingFrequency?: 'weekly' | 'monthly' | 'quarterly';
  enableSlackIntegration?: boolean;
  enableEmailNotifications?: boolean;
  
  // Verknüpfungen
  relatedBudgets?: string[];
  relatedProjects?: string[];
  linkedModules?: string[];
  
  // Genehmigung
  approvalRequired?: boolean;
  approvers?: string[];
  approvalDeadline?: string;
}

export interface GoalFormData {
  id?: string;
  title: string;
  description: string;
  target: string;
  priority?: string;
  deadline?: string;
  kpis?: any[];
}

export interface TaskFormData {
  id?: string;
  title: string;
  description: string;
  assignedTo: string;
  priority: string;
  dueDate: string;
}

export type ProjectFormStep = 'basic-info' | 'team' | 'timeline' | 'tasks' | 'goals' | 'financial' | 'resources';
