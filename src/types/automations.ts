
export interface AutomationTrigger {
  id: string;
  type: string;
  name: string;
  params: Record<string, string>;
}

export interface AutomationCondition {
  id: string;
  field: string;
  operator: string;
  value: string;
}

export interface AutomationAction {
  id: string;
  type: string;
  name: string;
  params: Record<string, string>;
}

export interface Automation {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'draft' | 'archived' | 'error';
  trigger: AutomationTrigger;
  conditions: AutomationCondition[];
  actions: AutomationAction[];
  created_at: string;
  updated_at: string;
  created_by: string;
  run_count: number;
  last_run?: string;
  last_run_status?: 'success' | 'error' | 'running';
}

export interface AutomationExecution {
  id: string;
  automation_id: string;
  automation_name: string;
  status: 'success' | 'error' | 'running';
  started_at: string;
  completed_at?: string;
  trigger_details?: Record<string, any>;
  error_message?: string;
}
