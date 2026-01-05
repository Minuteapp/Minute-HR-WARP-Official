import { Goal } from '@/types/goals';
import { supabase } from '@/integrations/supabase/client';

export interface AIGoalSuggestion {
  id: string;
  type: 'goal_creation' | 'progress_tip' | 'deadline_reminder' | 'optimization' | 'milestone_creation' | 'kpi_suggestion';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  actionable: boolean;
  suggestedAction?: {
    type: 'update_goal' | 'create_milestone' | 'set_reminder' | 'add_checklist';
    data: any;
  };
}

export interface AIAnalysisResult {
  suggestions: AIGoalSuggestion[];
  insights: {
    progressTrend: 'improving' | 'declining' | 'stable';
    riskLevel: 'low' | 'medium' | 'high';
    completionProbability: number;
    recommendations: string[];
  };
  reasoning?: string;
}

// Edge Function aufrufen
async function callGoalAI(action: string, params: Record<string, any>): Promise<AIAnalysisResult> {
  const { data, error } = await supabase.functions.invoke('goal-ai-suggestions', {
    body: { action, ...params }
  });

  if (error) {
    console.error('Goal AI Fehler:', error);
    throw new Error(error.message || 'KI-Service nicht verfügbar');
  }

  return data as AIAnalysisResult;
}

export const goalAIService = {
  async analyzeGoal(goal: Goal): Promise<AIAnalysisResult> {
    try {
      return await callGoalAI('analyze_goal', { 
        goal_id: goal.id
      });
    } catch (error) {
      console.error('Fehler bei Ziel-Analyse:', error);
      return this.localAnalyzeGoal(goal);
    }
  },

  async analyzeGoalPortfolio(goals: Goal[]): Promise<AIAnalysisResult> {
    if (goals.length === 0) {
      return {
        suggestions: [],
        insights: {
          progressTrend: 'stable',
          riskLevel: 'low',
          completionProbability: 0,
          recommendations: ['Erstellen Sie Ihr erstes Ziel, um KI-Analysen zu erhalten.']
        }
      };
    }

    try {
      return await callGoalAI('analyze_portfolio', { 
        goals: goals.map(g => ({
          id: g.id,
          title: g.title,
          progress: g.progress,
          status: g.status,
          priority: g.priority,
          due_date: g.due_date
        }))
      });
    } catch (error) {
      console.error('Fehler bei Portfolio-Analyse:', error);
      return this.localAnalyzePortfolio(goals);
    }
  },

  async generateGoalSuggestions(context: {
    category: 'personal' | 'team' | 'company';
    prompt?: string;
    existingGoals?: Goal[];
    company_id?: string;
    user_id?: string;
  }): Promise<AIGoalSuggestion[]> {
    try {
      const result = await callGoalAI('generate_suggestions', {
        category: context.category,
        prompt: context.prompt,
        company_id: context.company_id,
        user_id: context.user_id
      });
      return result.suggestions;
    } catch (error) {
      console.error('Fehler bei Zielvorschlägen:', error);
      return this.localGenerateSuggestions(context);
    }
  },

  async optimizeGoalStructure(goal: Goal): Promise<AIGoalSuggestion[]> {
    try {
      const result = await callGoalAI('optimize_structure', {
        goal_id: goal.id
      });
      return result.suggestions;
    } catch (error) {
      console.error('Fehler bei Struktur-Optimierung:', error);
      return this.localOptimizeStructure(goal);
    }
  },

  // Fallback: Lokale Analyse ohne KI
  localAnalyzeGoal(goal: Goal): AIAnalysisResult {
    const suggestions: AIGoalSuggestion[] = [];
    const daysRemaining = Math.ceil((new Date(goal.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysRemaining < 7 && goal.progress < 80) {
      suggestions.push({
        id: 'deadline_warning',
        type: 'deadline_reminder',
        title: 'Dringende Deadline-Warnung',
        description: `Nur noch ${daysRemaining} Tage bis zur Deadline, aber nur ${goal.progress}% erreicht.`,
        priority: 'high',
        actionable: true,
        suggestedAction: { type: 'set_reminder', data: { frequency: 'daily' } }
      });
    }

    if (goal.progress < 30 && daysRemaining > 0) {
      suggestions.push({
        id: 'progress_boost',
        type: 'progress_tip',
        title: 'Fortschritt beschleunigen',
        description: 'Teilen Sie dieses Ziel in kleinere Meilensteine auf.',
        priority: 'medium',
        actionable: true,
        suggestedAction: { type: 'create_milestone', data: { count: 3 } }
      });
    }

    if (!goal.kpi_target) {
      suggestions.push({
        id: 'kpi_missing',
        type: 'kpi_suggestion',
        title: 'KPI-Metriken hinzufügen',
        description: 'Definieren Sie messbare KPIs für dieses Ziel.',
        priority: 'medium',
        actionable: true
      });
    }

    return {
      suggestions,
      insights: {
        progressTrend: goal.progress > 50 ? 'improving' : 'declining',
        riskLevel: daysRemaining < 7 && goal.progress < 80 ? 'high' : 'medium',
        completionProbability: Math.min(95, goal.progress + (daysRemaining > 0 ? 20 : -10)),
        recommendations: [
          'Regelmäßige Fortschrittsupdates einplanen',
          'Meilensteine zur besseren Verfolgung definieren'
        ]
      }
    };
  },

  localAnalyzePortfolio(goals: Goal[]): AIAnalysisResult {
    const activeGoals = goals.filter(g => g.status === 'active');
    const overdueGoals = activeGoals.filter(g => new Date(g.due_date) < new Date() && g.progress < 100);
    
    const suggestions: AIGoalSuggestion[] = [];

    if (overdueGoals.length > 0) {
      suggestions.push({
        id: 'overdue_goals',
        type: 'deadline_reminder',
        title: `${overdueGoals.length} überfällige Ziele`,
        description: 'Priorisierung und Neuplanung erforderlich.',
        priority: 'high',
        actionable: true
      });
    }

    if (activeGoals.length > 10) {
      suggestions.push({
        id: 'too_many_goals',
        type: 'optimization',
        title: 'Zu viele gleichzeitige Ziele',
        description: 'Fokussieren Sie sich auf 3-5 Hauptziele.',
        priority: 'medium',
        actionable: true
      });
    }

    return {
      suggestions,
      insights: {
        progressTrend: 'stable',
        riskLevel: overdueGoals.length > 0 ? 'high' : 'medium',
        completionProbability: activeGoals.length > 0 ? 
          activeGoals.reduce((acc, goal) => acc + goal.progress, 0) / activeGoals.length : 0,
        recommendations: [
          'Regelmäßige Portfolio-Reviews durchführen',
          'Ressourcenverteilung optimieren'
        ]
      }
    };
  },

  localGenerateSuggestions(context: { category: string; prompt?: string }): AIGoalSuggestion[] {
    const suggestions: AIGoalSuggestion[] = [];

    if (context.category === 'personal') {
      suggestions.push({
        id: 'skill_development',
        type: 'goal_creation',
        title: 'Kompetenzentwicklung',
        description: 'Entwickeln Sie eine neue Fähigkeit für Ihre Karriere.',
        priority: 'medium',
        actionable: true
      });
    }

    if (context.category === 'team') {
      suggestions.push({
        id: 'team_collaboration',
        type: 'goal_creation',
        title: 'Team-Zusammenarbeit verbessern',
        description: 'Maßnahmen zur Verbesserung der Teamkommunikation.',
        priority: 'high',
        actionable: true
      });
    }

    return suggestions;
  },

  localOptimizeStructure(goal: Goal): AIGoalSuggestion[] {
    const suggestions: AIGoalSuggestion[] = [];

    if (!goal.description || goal.description.length < 20) {
      suggestions.push({
        id: 'improve_description',
        type: 'optimization',
        title: 'Beschreibung erweitern',
        description: 'Fügen Sie eine detailliertere Beschreibung hinzu.',
        priority: 'medium',
        actionable: true
      });
    }

    if (!goal.checklist || goal.checklist.length === 0) {
      suggestions.push({
        id: 'add_checklist',
        type: 'milestone_creation',
        title: 'Checkliste erstellen',
        description: 'Unterteilen Sie dieses Ziel in konkrete Schritte.',
        priority: 'medium',
        actionable: true,
        suggestedAction: {
          type: 'add_checklist',
          data: { items: ['Schritt 1', 'Schritt 2', 'Schritt 3'] }
        }
      });
    }

    return suggestions;
  }
};
