import { supabase } from '@/integrations/supabase/client';
import type { 
  RewardCampaign, 
  RewardInstance, 
  RewardTemplate, 
  PeerReward,
  CreateRewardCampaignRequest,
  RewardStats,
  RewardForecast
} from '@/types/rewards';

export const rewardsService = {
  // Kampagnen-Management
  async getCampaigns(filters?: {
    status?: string;
    trigger_type?: string;
  }): Promise<RewardCampaign[]> {
    let query = supabase.from('reward_campaigns').select('*');
    
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.trigger_type) {
      query = query.eq('trigger_type', filters.trigger_type);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async getCampaignById(id: string): Promise<RewardCampaign | null> {
    const { data, error } = await supabase
      .from('reward_campaigns')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },

  async createCampaign(campaign: CreateRewardCampaignRequest): Promise<RewardCampaign> {
    const { data: user } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('reward_campaigns')
      .insert({
        ...campaign,
        created_by: user?.user?.id
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateCampaign(id: string, updates: Partial<RewardCampaign>): Promise<RewardCampaign> {
    const { data, error } = await supabase
      .from('reward_campaigns')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteCampaign(id: string): Promise<void> {
    const { error } = await supabase
      .from('reward_campaigns')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Belohnungs-Instanzen
  async getRewardInstances(filters?: {
    employee_id?: string;
    campaign_id?: string;
    status?: string;
  }): Promise<RewardInstance[]> {
    let query = supabase.from('reward_instances').select('*');
    
    if (filters?.employee_id) {
      query = query.eq('employee_id', filters.employee_id);
    }
    if (filters?.campaign_id) {
      query = query.eq('campaign_id', filters.campaign_id);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async createRewardInstance(instance: Omit<RewardInstance, 'id' | 'created_at' | 'updated_at'>): Promise<RewardInstance> {
    const { data, error } = await supabase
      .from('reward_instances')
      .insert(instance)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async approveReward(id: string): Promise<RewardInstance> {
    const { data: user } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('reward_instances')
      .update({
        status: 'approved',
        approved_by: user?.user?.id,
        approved_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async redeemReward(id: string, voucher_code?: string): Promise<RewardInstance> {
    const { data, error } = await supabase
      .from('reward_instances')
      .update({
        status: 'redeemed',
        redeemed_at: new Date().toISOString(),
        voucher_code
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Templates
  async getTemplates(category?: string): Promise<RewardTemplate[]> {
    let query = supabase.from('reward_templates').select('*');
    
    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query.order('usage_count', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async createCampaignFromTemplate(templateId: string, overrides: Partial<CreateRewardCampaignRequest>): Promise<RewardCampaign> {
    const template = await this.getTemplateById(templateId);
    if (!template) throw new Error('Template not found');

    // Erhöhe usage_count
    await supabase
      .from('reward_templates')
      .update({ usage_count: template.usage_count + 1 })
      .eq('id', templateId);

    const campaignData: CreateRewardCampaignRequest = {
      name: overrides.name || template.name,
      description: overrides.description || template.description,
      trigger_type: template.trigger_type,
      trigger_conditions: { ...template.default_conditions, ...overrides.trigger_conditions },
      goodie_type: template.default_goodie_type,
      goodie_value: overrides.goodie_value || template.default_goodie_value,
      max_budget: overrides.max_budget || template.suggested_budget,
      ...overrides
    };

    return this.createCampaign(campaignData);
  },

  async getTemplateById(id: string): Promise<RewardTemplate | null> {
    const { data, error } = await supabase
      .from('reward_templates')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },

  // Peer Rewards
  async createPeerReward(peerReward: Omit<PeerReward, 'id' | 'created_at'>): Promise<PeerReward> {
    const { data, error } = await supabase
      .from('peer_rewards')
      .insert(peerReward)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getPeerRewards(userId?: string): Promise<PeerReward[]> {
    let query = supabase.from('peer_rewards').select('*');
    
    if (userId) {
      query = query.or(`nominator_id.eq.${userId},nominee_id.eq.${userId}`);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  // Statistiken und Forecast
  async getRewardStats(): Promise<RewardStats> {
    // Parallele Abfragen für bessere Performance
    const [campaignsRes, instancesRes, budgetRes] = await Promise.all([
      supabase.from('reward_campaigns').select('status'),
      supabase.from('reward_instances').select('goodie_type, goodie_value, created_at, status'),
      supabase.from('reward_campaigns').select('max_budget, used_budget')
    ]);

    if (campaignsRes.error || instancesRes.error || budgetRes.error) {
      throw new Error('Failed to fetch reward statistics');
    }

    const campaigns = campaignsRes.data || [];
    const instances = instancesRes.data || [];
    const budgets = budgetRes.data || [];

    // Berechne Statistiken
    const totalBudget = budgets.reduce((sum, b) => sum + (b.max_budget || 0), 0);
    const usedBudget = budgets.reduce((sum, b) => sum + (b.used_budget || 0), 0);

    // Monatliche Aufschlüsselung
    const monthlyRewards = this.calculateMonthlyRewards(instances);
    
    // Top Goodie Types
    const goodieTypeCounts = instances.reduce((acc, instance) => {
      acc[instance.goodie_type] = (acc[instance.goodie_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topGoodieTypes = Object.entries(goodieTypeCounts)
      .map(([type, count]) => ({
        type: type as any,
        count,
        percentage: (count / instances.length) * 100
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalCampaigns: campaigns.length,
      activeCampaigns: campaigns.filter(c => c.status === 'active').length,
      totalBudget,
      usedBudget,
      totalRewards: instances.length,
      pendingApprovals: instances.filter(i => i.status === 'pending').length,
      monthlyRewards,
      topGoodieTypes
    };
  },

  async getRewardForecast(period: string = 'next_quarter'): Promise<RewardForecast> {
    // Vereinfachte Forecast-Logik
    const activeCampaigns = await this.getCampaigns({ status: 'active' });
    const historicalInstances = await this.getRewardInstances();

    // Berechne Durchschnittswerte
    const avgRewardsPerMonth = historicalInstances.length / 12; // Vereinfacht
    const avgBudgetPerMonth = historicalInstances.reduce((sum, i) => sum + i.goodie_value, 0) / 12;

    const campaignImpact = activeCampaigns.map(campaign => ({
      campaignId: campaign.id,
      campaignName: campaign.name,
      estimatedTriggers: Math.round(avgRewardsPerMonth * 0.3), // Vereinfacht
      estimatedCost: campaign.goodie_value * Math.round(avgRewardsPerMonth * 0.3)
    }));

    const totalEstimatedBudget = campaignImpact.reduce((sum, c) => sum + c.estimatedCost, 0);
    const totalBudget = activeCampaigns.reduce((sum, c) => sum + (c.max_budget || 0), 0);

    return {
      period,
      estimatedRewards: Math.round(avgRewardsPerMonth * 3), // 3 Monate
      estimatedBudget: totalEstimatedBudget,
      campaignImpact,
      budgetUtilization: totalBudget > 0 ? (totalEstimatedBudget / totalBudget) * 100 : 0,
      riskFactors: this.calculateRiskFactors(activeCampaigns, totalEstimatedBudget, totalBudget)
    };
  },

  // Hilfsfunktionen
  calculateMonthlyRewards(instances: any[]): Array<{ month: string; count: number; value: number }> {
    const monthlyData = instances.reduce((acc, instance) => {
      const month = new Date(instance.created_at).toISOString().slice(0, 7); // YYYY-MM
      if (!acc[month]) {
        acc[month] = { count: 0, value: 0 };
      }
      acc[month].count++;
      acc[month].value += instance.goodie_value || 0;
      return acc;
    }, {} as Record<string, { count: number; value: number }>);

    return Object.entries(monthlyData)
      .map(([month, data]) => ({ 
        month, 
        count: (data as { count: number; value: number }).count, 
        value: (data as { count: number; value: number }).value 
      }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-12); // Letzte 12 Monate
  },

  calculateRiskFactors(campaigns: RewardCampaign[], estimatedBudget: number, totalBudget: number): string[] {
    const risks: string[] = [];

    if (estimatedBudget > totalBudget * 0.8) {
      risks.push('Hohes Budgetrisiko - Geschätzte Ausgaben überschreiten 80% des Budgets');
    }

    const expiringSoon = campaigns.filter(c => 
      c.end_date && new Date(c.end_date) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    );
    if (expiringSoon.length > 0) {
      risks.push(`${expiringSoon.length} Kampagne(n) laufen in den nächsten 30 Tagen ab`);
    }

    if (campaigns.some(c => !c.max_budget)) {
      risks.push('Kampagnen ohne Budgetlimit gefunden');
    }

    return risks;
  },

  // Integration mit anderen Modulen
  async triggerProjectCompletionReward(projectId: string, projectValue: number): Promise<void> {
    const campaigns = await this.getCampaigns({
      status: 'active',
      trigger_type: 'project_completion'
    });

    for (const campaign of campaigns) {
      const minValue = campaign.trigger_conditions.min_project_value || 0;
      if (projectValue >= minValue) {
        // Finde Projektteam-Mitglieder und erstelle Belohnungen
        // Diese Logik würde mit dem Projektmodul integriert
        console.log(`Triggering reward for project ${projectId}, campaign ${campaign.id}`);
      }
    }
  },

  async triggerGoalAchievementReward(goalId: string, achievementPercentage: number): Promise<void> {
    const campaigns = await this.getCampaigns({
      status: 'active', 
      trigger_type: 'goal_achievement'
    });

    for (const campaign of campaigns) {
      const requiredPercentage = campaign.trigger_conditions.achievement_percentage || 100;
      if (achievementPercentage >= requiredPercentage) {
        console.log(`Triggering goal achievement reward for ${goalId}, campaign ${campaign.id}`);
      }
    }
  }
};