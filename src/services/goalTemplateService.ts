
import { supabase } from '@/integrations/supabase/client';
import type { 
  GoalTemplate, 
  GoalTemplateCategory, 
  GoalTemplateUsage,
  CreateGoalTemplateRequest 
} from '@/types/goalTemplates';

export const goalTemplateService = {
  // Template-Verwaltung
  async getTemplates(category?: string): Promise<GoalTemplate[]> {
    let query = supabase
      .from('goal_templates')
      .select('*')
      .eq('status', 'active')
      .order('usage_count', { ascending: false });

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as GoalTemplate[];
  },

  async getTemplateById(id: string): Promise<GoalTemplate> {
    const { data, error } = await supabase
      .from('goal_templates')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as GoalTemplate;
  },

  async getPublicTemplates(): Promise<GoalTemplate[]> {
    const { data, error } = await supabase
      .from('goal_templates')
      .select('*')
      .eq('is_public', true)
      .eq('status', 'active')
      .order('usage_count', { ascending: false });

    if (error) throw error;
    return data as GoalTemplate[];
  },

  async getMyTemplates(): Promise<GoalTemplate[]> {
    const { data, error } = await supabase
      .from('goal_templates')
      .select('*')
      .eq('created_by', (await supabase.auth.getUser()).data.user?.id)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data as GoalTemplate[];
  },

  async createTemplate(template: CreateGoalTemplateRequest): Promise<GoalTemplate> {
    const { data, error } = await supabase
      .from('goal_templates')
      .insert({
        ...template,
        created_by: (await supabase.auth.getUser()).data.user?.id
      })
      .select()
      .single();

    if (error) throw error;
    return data as GoalTemplate;
  },

  async updateTemplate(id: string, updates: Partial<GoalTemplate>): Promise<GoalTemplate> {
    const { data, error } = await supabase
      .from('goal_templates')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as GoalTemplate;
  },

  async deleteTemplate(id: string): Promise<void> {
    const { error } = await supabase
      .from('goal_templates')
      .update({ status: 'archived' })
      .eq('id', id);

    if (error) throw error;
  },

  async duplicateTemplate(id: string, newName: string): Promise<GoalTemplate> {
    const originalTemplate = await this.getTemplateById(id);
    
    const { data, error } = await supabase
      .from('goal_templates')
      .insert({
        ...originalTemplate,
        id: undefined, // Neue UUID wird generiert
        name: newName,
        is_public: false,
        usage_count: 0,
        created_by: (await supabase.auth.getUser()).data.user?.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data as GoalTemplate;
  },

  // Kategorien-Verwaltung
  async getTemplateCategories(): Promise<GoalTemplateCategory[]> {
    const { data, error } = await supabase
      .from('goal_template_categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order');

    if (error) throw error;
    return data as GoalTemplateCategory[];
  },

  // Template-Verwendung
  async recordTemplateUsage(templateId: string, goalId: string): Promise<void> {
    const { error } = await supabase
      .from('goal_template_usage')
      .insert({
        template_id: templateId,
        user_id: (await supabase.auth.getUser()).data.user?.id,
        goal_id: goalId,
        metadata: {}
      });

    if (error) throw error;
  },

  async getTemplateUsageHistory(templateId: string): Promise<GoalTemplateUsage[]> {
    const { data, error } = await supabase
      .from('goal_template_usage')
      .select('*')
      .eq('template_id', templateId)
      .order('used_at', { ascending: false });

    if (error) throw error;
    return data as GoalTemplateUsage[];
  },

  // Suche und Filter
  async searchTemplates(query: string, filters?: {
    category?: string;
    template_type?: string;
    is_public?: boolean;
  }): Promise<GoalTemplate[]> {
    let dbQuery = supabase
      .from('goal_templates')
      .select('*')
      .eq('status', 'active');

    if (query) {
      dbQuery = dbQuery.or(`name.ilike.%${query}%,description.ilike.%${query}%`);
    }

    if (filters?.category) {
      dbQuery = dbQuery.eq('category', filters.category);
    }

    if (filters?.template_type) {
      dbQuery = dbQuery.eq('template_type', filters.template_type);
    }

    if (filters?.is_public !== undefined) {
      dbQuery = dbQuery.eq('is_public', filters.is_public);
    }

    const { data, error } = await dbQuery.order('usage_count', { ascending: false });
    if (error) throw error;
    return data as GoalTemplate[];
  },

  // Beliebte Templates
  async getPopularTemplates(limit: number = 10): Promise<GoalTemplate[]> {
    const { data, error } = await supabase
      .from('goal_templates')
      .select('*')
      .eq('status', 'active')
      .eq('is_public', true)
      .order('usage_count', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data as GoalTemplate[];
  },

  // Template aus Ziel erstellen
  async createTemplateFromGoal(goalId: string, templateData: {
    name: string;
    description?: string;
    category: string;
    template_type: string;
    is_public?: boolean;
  }): Promise<GoalTemplate> {
    // Hier würde normalerweise das Ziel geladen und in ein Template umgewandelt
    // Für jetzt ein einfaches Template erstellen
    const { data, error } = await supabase
      .from('goal_templates')
      .insert({
        ...templateData,
        fields: [
          {
            name: 'title',
            label: 'Titel',
            type: 'text',
            required: true,
            placeholder: 'Ziel-Titel eingeben...'
          },
          {
            name: 'description',
            label: 'Beschreibung',
            type: 'textarea',
            required: false,
            placeholder: 'Beschreibung des Ziels...'
          }
        ],
        default_values: {},
        validation_rules: {},
        required_roles: ['employee'],
        access_level: 'all',
        created_by: (await supabase.auth.getUser()).data.user?.id
      })
      .select()
      .single();

    if (error) throw error;
    return data as GoalTemplate;
  }
};
