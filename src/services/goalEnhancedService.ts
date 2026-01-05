import { supabase } from '@/integrations/supabase/client';
import { 
  EnhancedGoal, 
  GoalCycle, 
  KeyResult, 
  GoalCheckin, 
  GoalLink, 
  GoalReview,
  ProgressCalculation,
  GoalEvent,
  AlignmentTreeNode,
  AlignmentGap
} from '@/types/goals-enhanced';

export class GoalEnhancedService {
  // ===== CYCLES =====
  async getCycles(companyId?: string) {
    let query = supabase.from('goal_cycles').select('*');
    if (companyId) {
      query = query.eq('company_id', companyId);
    }
    const { data, error } = await query.order('start_date', { ascending: false });
    if (error) throw error;
    return data as GoalCycle[];
  }

  async createCycle(cycle: Omit<GoalCycle, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('goal_cycles')
      .insert([cycle])
      .select()
      .single();
    if (error) throw error;
    return data as GoalCycle;
  }

  async updateCycle(id: string, updates: Partial<GoalCycle>) {
    const { data, error } = await supabase
      .from('goal_cycles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as GoalCycle;
  }

  // ===== ENHANCED GOALS =====
  async getEnhancedGoals(filters?: {
    category?: string;
    level?: string;
    cycle_id?: string;
    status?: string;
    assigned_to?: string;
  }) {
    let query = supabase
      .from('goals')
      .select(`
        *,
        cycle:goal_cycles(*),
        key_results:goal_key_results(*),
        checkins:goal_checkins(*),
        links:goal_links(*),
        reviews:goal_reviews(*)
      `);

    if (filters) {
      if (filters.category) query = query.eq('category', filters.category);
      if (filters.level) query = query.eq('goal_level', filters.level);
      if (filters.cycle_id) query = query.eq('cycle_id', filters.cycle_id);
      if (filters.status) query = query.eq('status', filters.status);
      if (filters.assigned_to) query = query.contains('assigned_to', [filters.assigned_to]);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data as EnhancedGoal[];
  }

  async getGoalWithRelations(goalId: string) {
    const { data, error } = await supabase
      .from('goals')
      .select(`
        *,
        cycle:goal_cycles(*),
        key_results:goal_key_results(*),
        checkins:goal_checkins(*, submitted_by_profile:employees(name)),
        links:goal_links(*),
        reviews:goal_reviews(*)
      `)
      .eq('id', goalId)
      .single();
    
    if (error) throw error;
    return data as EnhancedGoal;
  }

  // ===== KEY RESULTS =====
  async createKeyResult(keyResult: Omit<KeyResult, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('goal_key_results')
      .insert([keyResult])
      .select()
      .single();
    if (error) throw error;
    return data as KeyResult;
  }

  async updateKeyResult(id: string, updates: Partial<KeyResult>) {
    const { data, error } = await supabase
      .from('goal_key_results')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as KeyResult;
  }

  async updateKeyResultProgress(id: string, currentValue: number) {
    const { data: keyResult } = await supabase
      .from('goal_key_results')
      .select('baseline_value, target_value')
      .eq('id', id)
      .single();

    if (!keyResult) throw new Error('Key Result not found');

    const progress = this.calculateProgress(
      keyResult.baseline_value,
      keyResult.target_value,
      currentValue
    );

    const isAtRisk = progress < 50 && new Date() > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // Risiko wenn < 50% und weniger als 7 Tage bis Ende

    const { data, error } = await supabase
      .from('goal_key_results')
      .update({ 
        current_value: currentValue,
        is_at_risk: isAtRisk
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as KeyResult;
  }

  // ===== CHECK-INS =====
  async createCheckin(checkin: Omit<GoalCheckin, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('goal_checkins')
      .insert([checkin])
      .select()
      .single();
    if (error) throw error;

    // Event publishen
    await this.publishEvent({
      type: 'goals.checkin.submitted',
      payload: {
        goal_id: checkin.goal_id,
        user_id: checkin.submitted_by || '',
        metadata: {
          confidence_level: checkin.confidence_level,
          status_update: checkin.status_update
        }
      },
      timestamp: new Date().toISOString()
    });

    return data as GoalCheckin;
  }

  async getCheckinsForGoal(goalId: string) {
    const { data, error } = await supabase
      .from('goal_checkins')
      .select(`
        *,
        submitted_by_profile:employees(name)
      `)
      .eq('goal_id', goalId)
      .order('checkin_date', { ascending: false });
    
    if (error) throw error;
    return data as GoalCheckin[];
  }

  // ===== GOAL LINKS =====
  async createGoalLink(link: Omit<GoalLink, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('goal_links')
      .insert([link])
      .select()
      .single();
    if (error) throw error;
    return data as GoalLink;
  }

  async getGoalLinks(goalId: string) {
    const { data, error } = await supabase
      .from('goal_links')
      .select('*')
      .eq('goal_id', goalId);
    
    if (error) throw error;
    return data as GoalLink[];
  }

  // ===== REVIEWS =====
  async createReview(review: Omit<GoalReview, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('goal_reviews')
      .insert([review])
      .select()
      .single();
    if (error) throw error;
    return data as GoalReview;
  }

  async submitReview(reviewId: string) {
    const { data, error } = await supabase
      .from('goal_reviews')
      .update({ 
        status: 'submitted',
        review_date: new Date().toISOString().split('T')[0]
      })
      .eq('id', reviewId)
      .select()
      .single();
    
    if (error) throw error;
    return data as GoalReview;
  }

  // ===== PROGRESS ENGINE =====
  async calculateGoalProgress(goalId: string): Promise<ProgressCalculation> {
    const goal = await this.getGoalWithRelations(goalId);
    
    if (!goal.key_results || goal.key_results.length === 0) {
      // Fallback für Goals ohne Key Results
      return {
        goal_id: goalId,
        current_progress: goal.progress,
        target_progress: 100,
        confidence_level: goal.confidence_level,
        is_at_risk: goal.is_at_risk,
        calculation_method: 'manual',
        last_updated: goal.updated_at,
        contributors: []
      };
    }

    // Berechne gewichteten Fortschritt aus Key Results
    let totalWeight = 0;
    let weightedProgress = 0;
    let averageConfidence = 0;
    let anyAtRisk = false;

    for (const kr of goal.key_results) {
      const progress = this.calculateProgress(kr.baseline_value, kr.target_value, kr.current_value);
      weightedProgress += progress * kr.weight;
      totalWeight += kr.weight;
      averageConfidence += kr.confidence_level * kr.weight;
      if (kr.is_at_risk) anyAtRisk = true;
    }

    const finalProgress = totalWeight > 0 ? weightedProgress / totalWeight : 0;
    const finalConfidence = totalWeight > 0 ? averageConfidence / totalWeight : 0;

    // Aktualisiere Goal Progress
    await supabase
      .from('goals')
      .update({
        progress: Math.round(finalProgress),
        confidence_level: finalConfidence,
        is_at_risk: anyAtRisk,
        last_checkin_date: new Date().toISOString().split('T')[0]
      })
      .eq('id', goalId);

    return {
      goal_id: goalId,
      current_progress: finalProgress,
      target_progress: 100,
      confidence_level: finalConfidence,
      is_at_risk: anyAtRisk,
      calculation_method: 'source',
      last_updated: new Date().toISOString(),
      contributors: goal.key_results.map(kr => ({
        source_module: 'key_results',
        source_id: kr.id,
        contribution_value: this.calculateProgress(kr.baseline_value, kr.target_value, kr.current_value),
        weight: kr.weight
      }))
    };
  }

  private calculateProgress(baseline: number, target: number, current: number): number {
    if (target === baseline) return current >= target ? 100 : 0;
    const progress = ((current - baseline) / (target - baseline)) * 100;
    return Math.max(0, Math.min(100, progress));
  }

  // ===== ALIGNMENT =====
  async getAlignmentTree(rootGoalId?: string): Promise<AlignmentTreeNode[]> {
    let query = supabase
      .from('goals')
      .select('id, title, goal_level, progress, confidence_level, is_at_risk, alignment_parent_id')
      .eq('status', 'active');

    if (rootGoalId) {
      query = query.or(`id.eq.${rootGoalId},alignment_parent_id.eq.${rootGoalId}`);
    } else {
      query = query.eq('goal_level', 'company');
    }

    const { data: goals, error } = await query;
    if (error) throw error;

    return this.buildAlignmentTree(goals, rootGoalId);
  }

  private buildAlignmentTree(goals: any[], parentId?: string): AlignmentTreeNode[] {
    const children = goals.filter(g => g.alignment_parent_id === parentId);
    
    return children.map((goal, index) => ({
      id: goal.id,
      title: goal.title,
      goal_level: goal.goal_level,
      progress: goal.progress,
      confidence_level: goal.confidence_level,
      is_at_risk: goal.is_at_risk,
      parent_id: goal.alignment_parent_id,
      children: this.buildAlignmentTree(goals, goal.id),
      position: {
        x: index * 200,
        y: 0
      }
    }));
  }

  async alignGoalToParent(goalId: string, parentGoalId: string) {
    const { data, error } = await supabase
      .from('goals')
      .update({ alignment_parent_id: parentGoalId })
      .eq('id', goalId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // ===== EVENT BUS =====
  private async publishEvent(event: GoalEvent) {
    // Hier würde normalerweise ein Event Bus verwendet
    // Für jetzt loggen wir nur
    console.log('Goal Event:', event);
    
    // Optional: Speichere Events in einer audit_log Tabelle
    try {
      await supabase.from('goal_audit_log').insert([{
        goal_id: event.payload.goal_id,
        user_id: event.payload.user_id,
        action: event.type,
        changes: event.payload.changes || {},
        created_at: event.timestamp
      }]);
    } catch (err) {
      console.warn('Failed to log goal event:', err);
    }
  }

  // ===== DASHBOARD DATA =====
  async getDashboardData(scope: 'org' | 'team' | 'individual', userId?: string) {
    const baseQuery = supabase
      .from('goals')
      .select(`
        id, title, progress, confidence_level, is_at_risk, goal_level, status,
        key_results:goal_key_results(id, title, current_value, target_value)
      `)
      .eq('status', 'active');

    let query = baseQuery;
    
    switch (scope) {
      case 'org':
        query = query.eq('goal_level', 'company');
        break;
      case 'team':
        query = query.eq('goal_level', 'team');
        if (userId) {
          // Hier würde man die Teams des Users abfragen
          query = query.contains('assigned_to', [userId]);
        }
        break;
      case 'individual':
        if (userId) {
          query = query.contains('assigned_to', [userId]);
        }
        break;
    }

    const { data: goals, error } = await query;
    if (error) throw error;

    // Berechne Metriken
    const totalGoals = goals.length;
    const completedGoals = goals.filter(g => g.progress >= 100).length;
    const atRiskGoals = goals.filter(g => g.is_at_risk).length;
    const averageProgress = totalGoals > 0 ? 
      Math.round(goals.reduce((sum, g) => sum + g.progress, 0) / totalGoals) : 0;
    const averageConfidence = totalGoals > 0 ?
      Math.round(goals.reduce((sum, g) => sum + (g.confidence_level * 100), 0) / totalGoals) : 0;

    return {
      totalGoals,
      completedGoals,
      atRiskGoals,
      averageProgress,
      averageConfidence,
      goals: goals.slice(0, 10) // Top 10 für Listen
    };
  }

  // ===== SOURCE INTEGRATION =====
  async updateFromSource(keyResultId: string, sourceModule: string, sourceMetric: string) {
    // Hier würde man die Daten aus dem entsprechenden Modul holen
    // Beispiel für verschiedene Module:
    let value = 0;
    
    switch (sourceModule) {
      case 'projects':
        value = await this.getProjectMetric(sourceMetric);
        break;
      case 'helpdesk':
        value = await this.getHelpdeskMetric(sourceMetric);
        break;
      case 'sales':
        value = await this.getSalesMetric(sourceMetric);
        break;
      case 'esg':
        value = await this.getESGMetric(sourceMetric);
        break;
      default:
        console.warn(`Unknown source module: ${sourceModule}`);
        return;
    }

    await this.updateKeyResultProgress(keyResultId, value);
  }

  private async getProjectMetric(metric: string): Promise<number> {
    // Beispiel-Implementation für Projekt-Metriken
    switch (metric) {
      case 'completion_rate':
        const { data } = await supabase
          .from('projects')
          .select('status')
          .eq('status', 'completed');
        return data?.length || 0;
      default:
        return 0;
    }
  }

  private async getHelpdeskMetric(metric: string): Promise<number> {
    // Beispiel-Implementation für Helpdesk-Metriken
    switch (metric) {
      case 'nps':
        const { data } = await supabase
          .from('tickets')
          .select('rating')
          .not('rating', 'is', null);
        if (!data || data.length === 0) return 0;
        const avgRating = data.reduce((sum, t) => sum + (t.rating || 0), 0) / data.length;
        return Math.round((avgRating - 1) * 25); // Convert 1-5 rating to NPS-like 0-100
      default:
        return 0;
    }
  }

  private async getSalesMetric(metric: string): Promise<number> {
    // Placeholder für Sales-Metriken
    return 0;
  }

  private async getESGMetric(metric: string): Promise<number> {
    // Beispiel-Implementation für ESG-Metriken
    switch (metric) {
      case 'co2_reduction':
        const { data } = await supabase
          .from('esg_goals')
          .select('progress')
          .eq('type', 'environmental');
        if (!data || data.length === 0) return 0;
        return Math.round(data.reduce((sum, g) => sum + (g.progress || 0), 0) / data.length);
      default:
        return 0;
    }
  }
}

export const goalEnhancedService = new GoalEnhancedService();