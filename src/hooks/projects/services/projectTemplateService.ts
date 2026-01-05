
import { supabase } from "@/integrations/supabase/client";
import { ProjectFormData } from "../types";

export interface ProjectTemplate {
  id: string;
  name: string;
  description?: string;
  category?: string;
  template_data: Record<string, any>;
  is_active: boolean;
  usage_count: number;
  last_used_at?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export const projectTemplateService = {
  // Alle verfügbaren Templates abrufen
  async getTemplates(category?: string): Promise<ProjectTemplate[]> {
    console.log('Fetching project templates, category:', category);
    
    let query = supabase
      .from('project_templates')
      .select('*')
      .eq('is_active', true)
      .order('usage_count', { ascending: false });

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching project templates:', error);
      throw error;
    }

    console.log(`Found ${data?.length || 0} project templates`);
    return data || [];
  },

  // Template nach ID abrufen
  async getTemplateById(id: string): Promise<ProjectTemplate | null> {
    console.log('Fetching project template by ID:', id);
    
    const { data, error } = await supabase
      .from('project_templates')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching project template:', error);
      throw error;
    }

    console.log('Project template fetched:', data);
    return data;
  },

  // Neues Template erstellen
  async createTemplate(template: Omit<ProjectTemplate, 'id' | 'created_at' | 'updated_at' | 'usage_count' | 'last_used_at'>): Promise<ProjectTemplate> {
    console.log('Creating project template:', template);
    
    const { data, error } = await supabase
      .from('project_templates')
      .insert({
        ...template,
        created_by: (await supabase.auth.getUser()).data.user?.id
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating project template:', error);
      throw error;
    }

    console.log('Project template created successfully:', data);
    return data;
  },

  // Template aktualisieren
  async updateTemplate(id: string, updates: Partial<ProjectTemplate>): Promise<ProjectTemplate> {
    console.log('Updating project template:', id, updates);
    
    const { data, error } = await supabase
      .from('project_templates')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating project template:', error);
      throw error;
    }

    console.log('Project template updated successfully:', data);
    return data;
  },

  // Template deaktivieren
  async deactivateTemplate(id: string): Promise<void> {
    console.log('Deactivating project template:', id);
    
    const { error } = await supabase
      .from('project_templates')
      .update({ is_active: false })
      .eq('id', id);

    if (error) {
      console.error('Error deactivating project template:', error);
      throw error;
    }

    console.log('Project template deactivated successfully');
  },

  // Template-Nutzung erhöhen
  async incrementUsage(templateId: string): Promise<void> {
    console.log('Incrementing template usage:', templateId);
    
    const { error } = await supabase.rpc('increment_template_usage', {
      template_id: templateId
    });

    if (error) {
      console.error('Error incrementing template usage:', error);
      throw error;
    }

    console.log('Template usage incremented successfully');
  },

  // Template-Kategorien abrufen
  async getCategories(): Promise<string[]> {
    console.log('Fetching template categories');
    
    const { data, error } = await supabase
      .from('project_templates')
      .select('category')
      .not('category', 'is', null)
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching template categories:', error);
      throw error;
    }

    const categories = [...new Set(data?.map(item => item.category).filter(Boolean))];
    console.log('Template categories found:', categories);
    return categories;
  }
};

// Als Template speichern
export const saveAsTemplate = async (formData: ProjectFormData): Promise<void> => {
  console.log('Saving project as template:', formData);
  
  if (!formData.name) {
    throw new Error('Projektname ist erforderlich für Template');
  }

  const templateData = {
    name: `${formData.name} - Template`,
    description: formData.description || '',
    category: formData.category || 'standard',
    template_data: {
      ...formData,
      // Entferne spezifische Projekt-IDs
      templateId: undefined,
      saveAsTemplate: false
    },
    is_active: true,
    usage_count: 0
  };

  await projectTemplateService.createTemplate(templateData);
  console.log('Project saved as template successfully');
};
