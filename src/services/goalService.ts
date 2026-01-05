
import { supabase } from '@/integrations/supabase/client';
import { Goal, GoalComment, GoalAttachment, GoalCategory } from '@/types/goals';
import { toast } from '@/hooks/use-toast';
import { goalAIService } from './goalAIService';

export const goalService = {
  async createGoal(goal: Omit<Goal, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const { data, error } = await supabase
        .from('goals')
        .insert({
          title: goal.title,
          description: goal.description,
          category: goal.category,
          status: goal.status,
          priority: goal.priority,
          progress: goal.progress,
          start_date: goal.start_date || new Date().toISOString(),
          due_date: goal.due_date,
          created_by: goal.created_by,
          assigned_to: goal.assigned_to,
          team_id: goal.team_id,
          parent_goal_id: goal.parent_goal_id,
          metadata: goal.metadata ? JSON.stringify(goal.metadata) : null,
          checklist: goal.checklist,
          kpi_target: goal.kpi_target,
          kpi_current: goal.kpi_current,
          measurement_unit: goal.measurement_unit,
          auto_reminders: goal.auto_reminders,
          reminder_frequency: goal.reminder_frequency
        })
        .select()
        .single();

      if (error) throw error;
      
      // KI-Analyse für neues Ziel starten
      if (data) {
        this.analyzeGoalWithAI(data.id);
      }
      
      return data;
    } catch (error) {
      console.error('Error creating goal:', error);
      toast({
        description: "Fehler beim Erstellen des Ziels. Bitte versuchen Sie es später erneut.",
        variant: "destructive",
      });
      throw error;
    }
  },

  async updateGoal(id: string, updates: Partial<Goal>) {
    try {
      const updatesWithStringifiedMetadata = {
        ...updates,
        metadata: updates.metadata ? JSON.stringify(updates.metadata) : null
      };

      const { data, error } = await supabase
        .from('goals')
        .update(updatesWithStringifiedMetadata)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      // KI-Re-Analyse bei signifikanten Änderungen
      if (updates.progress !== undefined || updates.due_date !== undefined) {
        this.analyzeGoalWithAI(id);
      }
      
      return data;
    } catch (error) {
      console.error('Error updating goal:', error);
      toast({
        description: "Fehler beim Aktualisieren des Ziels. Bitte versuchen Sie es später erneut.",
        variant: "destructive",
      });
      throw error;
    }
  },

  async deleteGoal(id: string) {
    try {
      const { error } = await supabase
        .from('goals')
        .update({ 
          status: 'deleted' as const, 
          deleted_at: new Date().toISOString() 
        })
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting goal:', error);
      toast({
        description: "Fehler beim Löschen des Ziels. Bitte versuchen Sie es später erneut.",
        variant: "destructive",
      });
      throw error;
    }
  },

  async archiveGoal(id: string) {
    try {
      const { error } = await supabase
        .from('goals')
        .update({ 
          status: 'archived' as const, 
          archived_at: new Date().toISOString() 
        })
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error archiving goal:', error);
      toast({
        description: "Fehler beim Archivieren des Ziels. Bitte versuchen Sie es später erneut.",
        variant: "destructive",
      });
      throw error;
    }
  },

  async getGoals(category?: GoalCategory) {
    try {
      let query = supabase
        .from('goals')
        .select('*')
        .neq('status', 'deleted');

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      // Parse the metadata back to object if it exists
      return data.map(goal => ({
        ...goal,
        metadata: goal.metadata ? JSON.parse(goal.metadata as string) : null
      }));
    } catch (error) {
      console.error('Error fetching goals:', error);
      toast({
        description: "Fehler beim Laden der Ziele. Bitte versuchen Sie es später erneut.",
        variant: "destructive",
      });
      throw error;
    }
  },

  async addComment(goalId: string, comment: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('goal_comments')
        .insert({
          goal_id: goalId,
          comment,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        description: "Fehler beim Hinzufügen des Kommentars. Bitte versuchen Sie es später erneut.",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Neue KI-Integration Methoden
  async analyzeGoalWithAI(goalId: string) {
    try {
      const { data: goal, error } = await supabase
        .from('goals')
        .select('*')
        .eq('id', goalId)
        .single();

      if (error || !goal) return;

      const parsedGoal = {
        ...goal,
        metadata: goal.metadata ? JSON.parse(goal.metadata as string) : null
      };

      // KI-Analyse ausführen
      const analysis = await goalAIService.analyzeGoal(parsedGoal);
      
      // Speichere Analyse-Ergebnisse in metadata
      const updatedMetadata = {
        ...parsedGoal.metadata,
        ai_analysis: {
          last_analyzed: new Date().toISOString(),
          insights: analysis.insights,
          suggestion_count: analysis.suggestions.length
        }
      };

      await this.updateGoal(goalId, { metadata: updatedMetadata });
      
      return analysis;
    } catch (error) {
      console.error('Error analyzing goal with AI:', error);
    }
  },

  async generateAIGoalSuggestions(context: {
    category: GoalCategory;
    prompt?: string;
    userId?: string;
  }) {
    try {
      // Lade existierende Ziele für Kontext
      const existingGoals = await this.getGoals(context.category);
      
      return await goalAIService.generateGoalSuggestions({
        category: context.category,
        prompt: context.prompt,
        existingGoals
      });
    } catch (error) {
      console.error('Error generating AI goal suggestions:', error);
      throw error;
    }
  },

  async createGoalFromAISuggestion(suggestion: any, userId: string) {
    try {
      const goalData = {
        title: suggestion.title,
        description: suggestion.description,
        category: suggestion.category,
        priority: suggestion.priority,
        progress: 0,
        status: 'active' as const,
        start_date: new Date().toISOString(),
        due_date: suggestion.due_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        created_by: userId,
        kpi_target: suggestion.kpi_target,
        measurement_unit: suggestion.measurement_unit,
        auto_reminders: true,
        reminder_frequency: 'weekly' as const,
        metadata: {
          created_with_ai: true,
          ai_suggestion_id: suggestion.id
        }
      };

      return await this.createGoal(goalData);
    } catch (error) {
      console.error('Error creating goal from AI suggestion:', error);
      throw error;
    }
  }
};
