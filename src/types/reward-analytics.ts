export interface RewardAnalyticsData {
  id: string;
  period_date: string;
  period_type: string;
  rewards_count: number;
  total_value: number;
  engagement_score: number;
  satisfaction_score: number;
  retention_rate: number;
  participation_rate: number;
  department?: string;
  company_id?: string;
  created_at: string;
}

export interface AnalyticsKPIs {
  engagementIncrease: number;
  retentionRate: number;
  satisfactionScore: number;
  participationRate: number;
}

export interface TopPerformer {
  id: string;
  name: string;
  avatar?: string;
  department?: string;
  rewardsReceived: number;
  kudosReceived: number;
  engagementScore: number;
}

export interface ROIAnalysis {
  totalInvestment: number;
  productivityIncrease: number;
  estimatedValue: number;
  roiMultiplier: number;
}

export interface TrendData {
  period: string;
  rewards: number;
  engagement: number;
  satisfaction?: number;
}

export interface DepartmentComparison {
  department: string;
  rewards: number;
  engagement: number;
}

export interface AnalyticsStatistics {
  kpis: AnalyticsKPIs;
  trendData: TrendData[];
  satisfactionTrend: Array<{ period: string; score: number }>;
  departmentComparison: DepartmentComparison[];
  rewardTypeDistribution: Array<{ type: string; count: number; percentage: number }>;
  topPerformers: TopPerformer[];
  roi: ROIAnalysis;
}
