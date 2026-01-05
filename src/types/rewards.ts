export type GoodieType = 
  | 'amazon_voucher'
  | 'zalando_voucher'
  | 'extra_vacation_day'
  | 'half_day_off'
  | 'meal_voucher'
  | 'cash_bonus'
  | 'donation_option'
  | 'physical_goodie'
  | 'custom';

export type RewardTriggerType = 
  | 'project_completion'
  | 'goal_achievement'
  | 'performance_score'
  | 'anniversary'
  | 'birthday'
  | 'innovation_idea'
  | 'peer_nomination'
  | 'custom_event';

export type CampaignStatus = 
  | 'draft'
  | 'active'
  | 'paused'
  | 'completed'
  | 'cancelled';

export interface RewardCampaign {
  id: string;
  name: string;
  description?: string;
  campaign_type: string;
  trigger_type: RewardTriggerType;
  trigger_conditions: Record<string, any>;
  goodie_type: GoodieType;
  goodie_value: number;
  goodie_description?: string;
  max_budget?: number;
  used_budget: number;
  max_participants?: number;
  current_participants: number;
  start_date?: string;
  end_date?: string;
  status: CampaignStatus;
  auto_approval: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
  metadata: Record<string, any>;
}

export interface RewardInstance {
  id: string;
  campaign_id?: string;
  employee_id: string;
  employee_name?: string;
  goodie_type: GoodieType;
  goodie_value: number;
  goodie_description?: string;
  status: 'pending' | 'approved' | 'redeemed' | 'expired';
  trigger_data: Record<string, any>;
  approval_required: boolean;
  approved_by?: string;
  approved_at?: string;
  redeemed_at?: string;
  expires_at?: string;
  voucher_code?: string;
  created_at: string;
  updated_at: string;
  metadata: Record<string, any>;
}

export interface RewardTemplate {
  id: string;
  name: string;
  description?: string;
  category: string;
  trigger_type: RewardTriggerType;
  default_conditions: Record<string, any>;
  default_goodie_type: GoodieType;
  default_goodie_value: number;
  suggested_budget?: number;
  is_system_template: boolean;
  usage_count: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface PeerReward {
  id: string;
  nominator_id: string;
  nominee_id: string;
  reason: string;
  points_awarded: number;
  campaign_id?: string;
  status: string;
  approved_by?: string;
  approved_at?: string;
  created_at: string;
}

export interface RewardBudgetTracking {
  id: string;
  campaign_id?: string;
  period_start: string;
  period_end: string;
  allocated_budget: number;
  used_budget: number;
  forecasted_usage: number;
  created_at: string;
  updated_at: string;
}

export interface CreateRewardCampaignRequest {
  name: string;
  description?: string;
  campaign_type?: string;
  trigger_type: RewardTriggerType;
  trigger_conditions: Record<string, any>;
  goodie_type: GoodieType;
  goodie_value: number;
  goodie_description?: string;
  max_budget?: number;
  max_participants?: number;
  start_date?: string;
  end_date?: string;
  auto_approval?: boolean;
  metadata?: Record<string, any>;
}

export interface RewardStats {
  totalCampaigns: number;
  activeCampaigns: number;
  totalBudget: number;
  usedBudget: number;
  totalRewards: number;
  pendingApprovals: number;
  monthlyRewards: Array<{ month: string; count: number; value: number }>;
  topGoodieTypes: Array<{ type: GoodieType; count: number; percentage: number }>;
}

export interface RewardForecast {
  period: string;
  estimatedRewards: number;
  estimatedBudget: number;
  campaignImpact: Array<{
    campaignId: string;
    campaignName: string;
    estimatedTriggers: number;
    estimatedCost: number;
  }>;
  budgetUtilization: number;
  riskFactors: string[];
}