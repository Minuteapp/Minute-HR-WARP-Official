
import { goalService } from './goalService';
import { goalAIService } from './goalAIService';
import { Goal, GoalCategory } from '@/types/goals';

export interface GoalSearchResult {
  goal: Goal;
  relevanceScore: number;
  aiInsights?: {
    recommendations: string[];
    potentialIssues: string[];
    suggestedActions: string[];
  };
}

export const goalSearchIntegrationService = {
  async searchGoalsWithAI(query: string, options?: {
    category?: GoalCategory;
    includeAIAnalysis?: boolean;
    maxResults?: number;
  }): Promise<GoalSearchResult[]> {
    try {
      // Lade alle Ziele basierend auf Kategorie
      const goals = await goalService.getGoals(options?.category);
      
      // Filtere Ziele basierend auf der Suchanfrage
      const filteredGoals = goals.filter(goal => {
        const searchText = query.toLowerCase();
        return (
          goal.title.toLowerCase().includes(searchText) ||
          (goal.description && goal.description.toLowerCase().includes(searchText)) ||
          goal.category.toLowerCase().includes(searchText)
        );
      });

      // Bewerte die Relevanz und erstelle Ergebnisse
      const results: GoalSearchResult[] = [];

      for (const goal of filteredGoals) {
        // Berechne Relevanz-Score
        const relevanceScore = this.calculateRelevanceScore(goal, query);
        
        let aiInsights;
        if (options?.includeAIAnalysis) {
          // Analysiere das Ziel mit KI
          const analysis = await goalAIService.analyzeGoal(goal);
          aiInsights = {
            recommendations: analysis.insights.recommendations,
            potentialIssues: analysis.suggestions
              .filter(s => s.priority === 'high')
              .map(s => s.description),
            suggestedActions: analysis.suggestions
              .filter(s => s.actionable)
              .map(s => s.title)
          };
        }

        results.push({
          goal,
          relevanceScore,
          aiInsights
        });
      }

      // Sortiere nach Relevanz-Score
      results.sort((a, b) => b.relevanceScore - a.relevanceScore);

      // Begrenze die Anzahl der Ergebnisse
      const maxResults = options?.maxResults || 10;
      return results.slice(0, maxResults);

    } catch (error) {
      console.error('Fehler bei der Zielsuche mit KI:', error);
      return [];
    }
  },

  async generateGoalSearchSuggestions(query: string): Promise<string[]> {
    try {
      // Verwende die KI, um Suchvorschläge zu generieren
      const suggestions = await goalAIService.generateGoalSuggestions({
        category: 'personal',
        prompt: `Suchvorschläge für: ${query}`,
        existingGoals: []
      });

      return suggestions.map(suggestion => suggestion.title);
    } catch (error) {
      console.error('Fehler beim Generieren von Suchvorschlägen:', error);
      return [];
    }
  },

  calculateRelevanceScore(goal: Goal, query: string): number {
    const searchText = query.toLowerCase();
    let score = 0;

    // Titel-Match (höchste Gewichtung)
    if (goal.title.toLowerCase().includes(searchText)) {
      score += 10;
    }

    // Beschreibungs-Match
    if (goal.description && goal.description.toLowerCase().includes(searchText)) {
      score += 5;
    }

    // Kategorie-Match
    if (goal.category.toLowerCase().includes(searchText)) {
      score += 3;
    }

    // Priorität-Bonus
    if (goal.priority === 'high') {
      score += 2;
    } else if (goal.priority === 'medium') {
      score += 1;
    }

    // Status-Bonus für aktive Ziele
    if (goal.status === 'active') {
      score += 1;
    }

    return score;
  },

  async searchGoalsByAIIntent(intent: string, context?: {
    userId?: string;
    timeframe?: 'week' | 'month' | 'quarter' | 'year';
    priority?: 'high' | 'medium' | 'low';
  }): Promise<GoalSearchResult[]> {
    try {
      // Analysiere die Absicht mit KI
      const suggestions = await goalAIService.generateGoalSuggestions({
        category: 'personal',
        prompt: intent,
        existingGoals: await goalService.getGoals()
      });

      // Konvertiere KI-Vorschläge in Suchergebnisse
      const results: GoalSearchResult[] = [];

      for (const suggestion of suggestions) {
        // Erstelle ein temporäres Ziel-Objekt für die Suche
        const tempGoal: Goal = {
          id: suggestion.id,
          title: suggestion.title,
          description: suggestion.description,
          category: 'personal',
          status: 'active',
          priority: suggestion.priority as 'high' | 'medium' | 'low',
          progress: 0,
          start_date: new Date().toISOString(),
          due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          created_by: context?.userId || '',
          auto_reminders: true,
          reminder_frequency: 'weekly',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        results.push({
          goal: tempGoal,
          relevanceScore: suggestion.priority === 'high' ? 10 : 
                         suggestion.priority === 'medium' ? 5 : 2,
          aiInsights: {
            recommendations: [`Basiert auf KI-Analyse für: ${intent}`],
            potentialIssues: [],
            suggestedActions: suggestion.actionable ? [suggestion.title] : []
          }
        });
      }

      return results;
    } catch (error) {
      console.error('Fehler bei der KI-Intent-Suche:', error);
      return [];
    }
  }
};
