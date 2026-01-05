import { supabase } from '@/integrations/supabase/client';
import { 
  UserGoalStats, 
  DepartmentStats, 
  KPIMetric, 
  AIInsight, 
  GoalCardData 
} from '@/types/goals-statistics';

// Echte DB-Abfragen statt Mock-Daten
export const goalsStatisticsService = {
  async getUserGoalStats(userId: string): Promise<UserGoalStats> {
    // Lade Profil-Daten
    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name, role')
      .eq('id', userId)
      .single();

    // Lade Ziele des Users
    const { data: goals } = await supabase
      .from('goals')
      .select('*')
      .eq('assigned_to', userId);

    const goalsData = goals || [];
    const totalGoals = goalsData.length;
    const completedGoals = goalsData.filter(g => g.status === 'completed').length;
    const onTrack = goalsData.filter(g => g.status === 'on_track' || g.status === 'in_progress').length;
    const atRisk = goalsData.filter(g => g.status === 'at_risk').length;
    const behind = goalsData.filter(g => g.status === 'behind' || g.status === 'overdue').length;

    return {
      userId,
      userName: profile?.display_name || '',
      department: '',
      role: profile?.role || '',
      isAdmin: profile?.role === 'admin',
      totalGoals,
      onTrack,
      atRisk,
      behind,
      completionRate: totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0,
      alignmentRate: 0,
    };
  },

  async getDepartmentStats(): Promise<DepartmentStats[]> {
    // Lade Ziele gruppiert nach Abteilung
    const { data: goals } = await supabase
      .from('goals')
      .select('department, status, progress');

    if (!goals || goals.length === 0) {
      return [];
    }

    // Gruppiere nach Abteilung
    const deptMap = new Map<string, { total: number; completed: number; onTrack: number; atRisk: number; behind: number }>();
    
    goals.forEach(goal => {
      const dept = goal.department || 'Unbekannt';
      if (!deptMap.has(dept)) {
        deptMap.set(dept, { total: 0, completed: 0, onTrack: 0, atRisk: 0, behind: 0 });
      }
      const stats = deptMap.get(dept)!;
      stats.total++;
      if (goal.status === 'completed') stats.completed++;
      if (goal.status === 'on_track' || goal.status === 'in_progress') stats.onTrack++;
      if (goal.status === 'at_risk') stats.atRisk++;
      if (goal.status === 'behind' || goal.status === 'overdue') stats.behind++;
    });

    return Array.from(deptMap.entries()).map(([department, stats]) => ({
      department,
      totalGoals: stats.total,
      completionRate: stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0,
      onTrack: stats.onTrack,
      atRisk: stats.atRisk,
      behind: stats.behind
    }));
  },

  async getKPIMetrics(): Promise<KPIMetric[]> {
    // Lade KPIs aus der Datenbank
    const { data: kpis } = await supabase
      .from('company_kpis')
      .select('*')
      .order('created_at', { ascending: false });

    if (!kpis || kpis.length === 0) {
      return [];
    }

    return kpis.map(kpi => ({
      id: kpi.id,
      name: kpi.name || '',
      currentValue: Number(kpi.current_value) || 0,
      targetValue: Number(kpi.target_value) || 0,
      unit: kpi.unit || '',
      trend: kpi.trend as 'up' | 'down' | 'stable' || 'stable',
      status: (kpi.status === 'behind' ? 'at-risk' : kpi.status) as 'on-track' | 'at-risk' | 'critical' || 'on-track',
      progress: kpi.target_value ? Math.round((Number(kpi.current_value) / Number(kpi.target_value)) * 100) : 0
    }));
  },

  async getAIInsights(userId: string): Promise<AIInsight[]> {
    // Lade AI Insights aus der Datenbank
    const { data: insights } = await supabase
      .from('ai_suggestions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (!insights || insights.length === 0) {
      return [];
    }

    return insights.map(insight => ({
      id: insight.id,
      type: (insight.use_case_type as 'warning' | 'recommendation' | 'forecast' | 'correlation' | 'new-goal' | 'capacity') || 'recommendation',
      title: insight.suggestion_title,
      confidence: insight.estimated_roi || 0,
      description: insight.description,
      action: insight.expected_benefit || '',
      actionable: !!insight.expected_benefit,
      relatedGoalIds: [],
      createdAt: insight.created_at || new Date().toISOString(),
    }));
  },

  async getMyGoals(userId: string): Promise<GoalCardData[]> {
    const { data: goals } = await supabase
      .from('goals')
      .select('*')
      .eq('assigned_to', userId)
      .order('created_at', { ascending: false });

    if (!goals || goals.length === 0) {
      return [];
    }

    return goals.map(goal => ({
      id: goal.id,
      title: goal.title || '',
      description: goal.description || '',
      status: (goal.status as 'on-track' | 'at-risk' | 'behind') || 'on-track',
      priority: (goal.priority as 'low' | 'medium' | 'high') || 'medium',
      progress: goal.progress || 0,
      owner: '',
      department: goal.department || '',
      dueDate: goal.due_date || '',
      keyResults: [],
      tags: [],
    }));
  },

  async getTeamGoals(teamId: string): Promise<GoalCardData[]> {
    const { data: goals } = await supabase
      .from('goals')
      .select('*')
      .eq('team_id', teamId)
      .order('created_at', { ascending: false });

    if (!goals || goals.length === 0) {
      return [];
    }

    return goals.map(goal => ({
      id: goal.id,
      title: goal.title || '',
      description: goal.description || '',
      status: (goal.status as 'on-track' | 'at-risk' | 'behind') || 'on-track',
      priority: (goal.priority as 'low' | 'medium' | 'high') || 'medium',
      progress: goal.progress || 0,
      owner: '',
      department: goal.department || '',
      dueDate: goal.due_date || '',
      keyResults: [],
      tags: [],
    }));
  },

  async getCompanyGoals(): Promise<GoalCardData[]> {
    const { data: goals } = await supabase
      .from('goals')
      .select('*')
      .eq('scope', 'company')
      .order('created_at', { ascending: false });

    if (!goals || goals.length === 0) {
      return [];
    }

    return goals.map(goal => ({
      id: goal.id,
      title: goal.title || '',
      description: goal.description || '',
      status: (goal.status as 'on-track' | 'at-risk' | 'behind') || 'on-track',
      priority: (goal.priority as 'low' | 'medium' | 'high') || 'medium',
      progress: goal.progress || 0,
      owner: '',
      department: goal.department || '',
      dueDate: goal.due_date || '',
      keyResults: [],
      tags: [],
    }));
  },
};
