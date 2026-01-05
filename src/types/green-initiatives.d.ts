
export interface GreenInitiative {
  id: string;
  title: string;
  description?: string;
  start_date: string;
  end_date?: string;
  budget?: number;
  currency?: string;
  status: 'active' | 'completed' | 'cancelled';
  target_impact?: string;
  actual_impact?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface GreenInitiativeTask {
  id: string;
  initiative_id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in-progress' | 'completed';
  due_date?: string;
  assigned_to?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface GreenInitiativeTeamMember {
  id: string;
  initiative_id: string;
  user_id: string;
  role: 'admin' | 'member';
  joined_at: string;
}

export interface GreenInitiativeProgress {
  id: string;
  initiative_id: string;
  metric_name: string;
  target_value?: number;
  current_value?: number;
  unit?: string;
  updated_at: string;
}
