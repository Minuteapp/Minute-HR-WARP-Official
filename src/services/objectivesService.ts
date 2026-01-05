import { supabase } from "@/integrations/supabase/client";
import type {
  Objective,
  KeyResult,
  ObjectiveAuditEntry,
  ObjectiveSuggestion,
  ObjectiveApproval,
  ObjectiveTemplate,
  ObjectiveComment,
  CreateObjectiveInput,
  UpdateObjectiveInput,
  ObjectiveFilters,
  ObjectiveDashboardData,
  RiskAssessment,
  ProgressForecast
} from "@/types/objectives";

export class ObjectivesService {
  // Dashboard & Overview
  static async getDashboardData(): Promise<ObjectiveDashboardData> {
    const { data: objectives, error } = await supabase
      .from('objectives')
      .select(`
        *,
        key_results (*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const activeObjectives = objectives?.filter(obj => obj.status === 'active') || [];
    const completedObjectives = objectives?.filter(obj => obj.status === 'completed') || [];
    const atRiskObjectives = objectives?.filter(obj => obj.risk_score > 60) || [];

    const avgProgress = objectives?.length 
      ? objectives.reduce((sum, obj) => sum + obj.progress, 0) / objectives.length 
      : 0;

    return {
      total_objectives: objectives?.length || 0,
      active_objectives: activeObjectives.length,
      completed_objectives: completedObjectives.length,
      at_risk_objectives: atRiskObjectives.length,
      avg_progress: Math.round(avgProgress),
      objectives_by_status: objectives?.reduce((acc, obj) => {
        acc[obj.status] = (acc[obj.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {},
      objectives_by_priority: objectives?.reduce((acc, obj) => {
        acc[obj.priority] = (acc[obj.priority] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {},
      recent_objectives: objectives?.slice(0, 5) || [],
      top_performers: objectives
        ?.filter(obj => obj.progress > 80)
        .map(obj => ({
          objective: obj,
          performance_score: obj.progress
        }))
        .sort((a, b) => b.performance_score - a.performance_score)
        .slice(0, 5) || []
    };
  }

  // CRUD Operations
  static async getObjectives(filters?: ObjectiveFilters): Promise<Objective[]> {
    let query = supabase
      .from('objectives')
      .select(`
        *,
        key_results (*),
        objective_comments (*)
      `)
      .order('created_at', { ascending: false });

    if (filters?.status?.length) {
      query = query.in('status', filters.status);
    }
    if (filters?.priority?.length) {
      query = query.in('priority', filters.priority);
    }
    if (filters?.objective_type?.length) {
      query = query.in('objective_type', filters.objective_type);
    }
    if (filters?.owner_id) {
      query = query.eq('owner_id', filters.owner_id);
    }
    if (filters?.team_id) {
      query = query.eq('team_id', filters.team_id);
    }
    if (filters?.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  static async getObjective(id: string): Promise<Objective> {
    const { data, error } = await supabase
      .from('objectives')
      .select(`
        *,
        key_results (*),
        objective_audit_trail (*),
        objective_comments (*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  static async createObjective(input: CreateObjectiveInput): Promise<Objective> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // company_id über RPC ermitteln (unterstützt Tenant-Modus)
    const { data: companyId } = await supabase.rpc('get_effective_company_id');
    
    if (!companyId) {
      throw new Error('Bitte wählen Sie eine Firma aus oder wechseln Sie in den Tenant-Modus.');
    }

    // Erstelle Objective
    const { data: objective, error: objectiveError } = await supabase
      .from('objectives')
      .insert({
        ...input,
        company_id: companyId,
        created_by: user.id,
        owner_id: input.owner_id || user.id
      })
      .select()
      .single();

    if (objectiveError) throw objectiveError;

    // Erstelle Key Results
    if (input.key_results?.length) {
      const keyResultsData = input.key_results.map(kr => ({
        ...kr,
        objective_id: objective.id
      }));

      const { error: keyResultsError } = await supabase
        .from('key_results')
        .insert(keyResultsData);

      if (keyResultsError) throw keyResultsError;
    }

    return this.getObjective(objective.id);
  }

  static async updateObjective(input: UpdateObjectiveInput): Promise<Objective> {
    const { id, key_results, ...updateData } = input;

    const { error } = await supabase
      .from('objectives')
      .update(updateData)
      .eq('id', id);

    if (error) throw error;

    // Update Key Results wenn vorhanden
    if (key_results) {
      // Lösche bestehende Key Results
      await supabase
        .from('key_results')
        .delete()
        .eq('objective_id', id);

      // Erstelle neue Key Results
      if (key_results.length > 0) {
        const keyResultsData = key_results.map(kr => ({
          ...kr,
          objective_id: id
        }));

        const { error: keyResultsError } = await supabase
          .from('key_results')
          .insert(keyResultsData);

        if (keyResultsError) throw keyResultsError;
      }
    }

    return this.getObjective(id);
  }

  static async deleteObjective(id: string): Promise<void> {
    const { error } = await supabase
      .from('objectives')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Key Results
  static async updateKeyResult(id: string, updates: Partial<KeyResult>): Promise<KeyResult> {
    const { data, error } = await supabase
      .from('key_results')
      .update({
        ...updates,
        last_updated: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // AI Suggestions
  static async getSuggestions(userId?: string): Promise<ObjectiveSuggestion[]> {
    const { data, error } = await supabase
      .from('objective_suggestions')
      .select('*')
      .eq('user_id', userId || (await supabase.auth.getUser()).data.user?.id)
      .eq('status', 'pending')
      .gte('expires_at', new Date().toISOString())
      .order('confidence_score', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async generateSuggestions(context: {
    objective_type?: string;
    team_id?: string;
    period?: { start: string; end: string };
  }): Promise<ObjectiveSuggestion[]> {
    // Mock KI-Vorschläge basierend auf Kontext
    const mockSuggestions: ObjectiveSuggestion[] = [
      {
        id: 'mock-1',
        user_id: (await supabase.auth.getUser()).data.user?.id || '',
        suggestion_type: 'title',
        suggested_title: `${context.objective_type === 'okr' ? 'Umsatz um 15% steigern' : 'KPI: Kundenzufriedenheit verbessern'}`,
        suggested_metrics: [],
        confidence_score: 0.85,
        based_on_data: { historical_performance: true, team_capacity: true },
        status: 'pending',
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'mock-2',
        user_id: (await supabase.auth.getUser()).data.user?.id || '',
        suggestion_type: 'key_result',
        suggested_title: undefined,
        suggested_metrics: [
          { metric: 'Umsatz', target_value: 1200000, unit: 'EUR' },
          { metric: 'Neue Kunden', target_value: 50, unit: 'Anzahl' },
          { metric: 'Conversion Rate', target_value: 12.5, unit: '%' }
        ],
        confidence_score: 0.78,
        based_on_data: { previous_quarters: true, market_trends: true },
        status: 'pending',
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    return mockSuggestions;
  }

  // Risk Assessment
  static async calculateRiskScore(objectiveId: string): Promise<RiskAssessment> {
    const objective = await this.getObjective(objectiveId);
    
    // Mock Risikobewertung basierend auf Objective-Daten
    const factors = [
      {
        factor: 'Zeitplan',
        impact: objective.progress < 50 ? 0.8 : 0.3,
        description: objective.progress < 50 
          ? 'Fortschritt liegt unter den Erwartungen'
          : 'Zeitplan wird eingehalten'
      },
      {
        factor: 'Ressourcen',
        impact: objective.linked_budgets.length === 0 ? 0.6 : 0.2,
        description: objective.linked_budgets.length === 0
          ? 'Keine Budgets verknüpft'
          : 'Ausreichende Budgetplanung'
      },
      {
        factor: 'Komplexität',
        impact: objective.key_results?.length || 0 > 5 ? 0.7 : 0.4,
        description: (objective.key_results?.length || 0) > 5
          ? 'Viele Key Results erhöhen Komplexität'
          : 'Überschaubare Anzahl Key Results'
      }
    ];

    const avgImpact = factors.reduce((sum, f) => sum + f.impact, 0) / factors.length;
    const riskScore = Math.round(avgImpact * 100);

    let level: 'low' | 'medium' | 'high' | 'critical';
    if (riskScore < 30) level = 'low';
    else if (riskScore < 60) level = 'medium';
    else if (riskScore < 80) level = 'high';
    else level = 'critical';

    return {
      score: riskScore,
      level,
      factors,
      recommendations: [
        riskScore > 60 ? 'Regelmäßige Statusupdates einplanen' : 'Aktueller Verlauf ist positiv',
        objective.linked_projects.length === 0 ? 'Verknüpfung mit relevanten Projekten empfohlen' : '',
        'Kontinuierliches Monitoring der Key Results'
      ].filter(Boolean),
      confidence: 0.82
    };
  }

  // Approval Workflow
  static async submitForApproval(objectiveId: string): Promise<void> {
    const { error } = await supabase
      .from('objectives')
      .update({
        approval_status: 'pending',
        status: 'active'
      })
      .eq('id', objectiveId);

    if (error) throw error;
  }

  static async approveObjective(objectiveId: string, comments?: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('objectives')
      .update({
        approval_status: 'approved',
        approved_by: user.id,
        approved_at: new Date().toISOString()
      })
      .eq('id', objectiveId);

    if (error) throw error;

    // Erstelle Approval-Eintrag
    await supabase
      .from('objective_approvals')
      .insert({
        objective_id: objectiveId,
        approver_id: user.id,
        status: 'approved',
        comments,
        approved_at: new Date().toISOString()
      });
  }

  // Templates
  static async getTemplates(): Promise<ObjectiveTemplate[]> {
    const { data, error } = await supabase
      .from('objective_templates')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) throw error;
    return data || [];
  }

  // Comments
  static async addComment(objectiveId: string, comment: string): Promise<ObjectiveComment> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('objective_comments')
      .insert({
        objective_id: objectiveId,
        user_id: user.id,
        comment
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Progress Forecast
  static async getProgressForecast(objectiveId: string): Promise<ProgressForecast> {
    const objective = await this.getObjective(objectiveId);
    
    // Mock Forecast basierend auf aktuellen Daten
    const daysRemaining = Math.ceil(
      (new Date(objective.period_end).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    
    const dailyProgressRate = objective.progress / 
      Math.max(1, Math.ceil((new Date().getTime() - new Date(objective.period_start).getTime()) / (1000 * 60 * 60 * 24)));
    
    const projectedProgress = Math.min(100, objective.progress + (dailyProgressRate * daysRemaining));
    
    return {
      projected_completion: new Date(
        new Date().getTime() + ((100 - objective.progress) / dailyProgressRate) * 24 * 60 * 60 * 1000
      ).toISOString(),
      confidence_interval: {
        min: Math.max(0, projectedProgress - 15),
        max: Math.min(100, projectedProgress + 10)
      },
      trend: dailyProgressRate > 1 ? 'positive' : dailyProgressRate < 0.5 ? 'negative' : 'stable',
      factors: [
        { name: 'Historische Performance', impact: 0.4 },
        { name: 'Verfügbare Ressourcen', impact: 0.3 },
        { name: 'Externe Faktoren', impact: 0.3 }
      ]
    };
  }
}