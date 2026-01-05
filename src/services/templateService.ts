
import { supabase } from "@/integrations/supabase/client";
import type { 
  UniversalTemplate,
  TemplatePlaceholder,
  TemplatePermission,
  TemplateVersion,
  TemplateUsage
} from "@/types/templates";

export const templateService = {
  // Universal Template Operations
  async getTemplates(category?: string, filters?: any): Promise<UniversalTemplate[]> {
    let query = supabase
      .from('universal_templates')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as UniversalTemplate[];
  },

  async getTemplateById(id: string): Promise<UniversalTemplate> {
    const { data, error } = await supabase
      .from('universal_templates')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as UniversalTemplate;
  },

  async createTemplate(template: Partial<UniversalTemplate>): Promise<UniversalTemplate> {
    const { data, error } = await supabase
      .from('universal_templates')
      .insert({
        ...template,
        version: 1,
        usage_count: 0,
        created_by: (await supabase.auth.getUser()).data.user?.id
      })
      .select()
      .single();

    if (error) throw error;
    return data as UniversalTemplate;
  },

  async updateTemplate(id: string, updates: Partial<UniversalTemplate>): Promise<UniversalTemplate> {
    // Create version snapshot before updating
    const currentTemplate = await this.getTemplateById(id);
    await this.createVersionSnapshot(id, currentTemplate.content);

    const { data, error } = await supabase
      .from('universal_templates')
      .update({
        ...updates,
        version: currentTemplate.version + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as UniversalTemplate;
  },

  async duplicateTemplate(id: string, newName: string): Promise<UniversalTemplate> {
    const original = await this.getTemplateById(id);
    const duplicate = {
      ...original,
      name: newName,
      parent_template_id: id,
      is_system_template: false,
      usage_count: 0
    };
    delete duplicate.id;
    delete duplicate.created_at;
    delete duplicate.updated_at;

    return this.createTemplate(duplicate);
  },

  // File Upload
  async uploadTemplateFile(file: File, templateId: string): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const filePath = `templates/${templateId}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('templates')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    return filePath;
  },

  // Version Management
  async createVersionSnapshot(templateId: string, content: any): Promise<TemplateVersion> {
    const template = await this.getTemplateById(templateId);
    
    const { data, error } = await supabase
      .from('template_versions')
      .insert({
        template_id: templateId,
        version_number: template.version,
        content_snapshot: content,
        created_by: (await supabase.auth.getUser()).data.user?.id
      })
      .select()
      .single();

    if (error) throw error;
    return data as TemplateVersion;
  },

  async getTemplateVersions(templateId: string): Promise<TemplateVersion[]> {
    const { data, error } = await supabase
      .from('template_versions')
      .select('*')
      .eq('template_id', templateId)
      .order('version_number', { ascending: false });

    if (error) throw error;
    return data as TemplateVersion[];
  },

  // Usage Tracking
  async recordTemplateUsage(templateId: string, module: string, usageData: any): Promise<void> {
    await supabase
      .from('template_usage')
      .insert({
        template_id: templateId,
        user_id: (await supabase.auth.getUser()).data.user?.id,
        used_in_module: module,
        usage_data: usageData
      });

    // Increment usage count using RPC function
    await supabase.rpc('increment_template_usage', { template_id: templateId });
  },

  async getTemplateUsageStats(templateId: string): Promise<TemplateUsage[]> {
    const { data, error } = await supabase
      .from('template_usage')
      .select('*')
      .eq('template_id', templateId)
      .order('used_at', { ascending: false });

    if (error) throw error;
    return data as TemplateUsage[];
  },

  // AI Functions
  async generateTemplateFromAI(prompt: string, category: string): Promise<Partial<UniversalTemplate>> {
    // This would call an AI service to generate template content
    // For now, return a mock template
    return {
      name: `AI-generiertes ${category} Template`,
      description: `Automatisch generiert basierend auf: ${prompt}`,
      category: category as any,
      template_type: 'ai_generated',
      content: {
        title: 'AI Template',
        description: prompt,
        fields: []
      },
      placeholders: [],
      is_active: true,
      is_system_template: false,
      access_level: 'all',
      languages: ['de']
    };
  },

  // System Integration
  async getTemplatesForModule(module: string): Promise<UniversalTemplate[]> {
    const { data, error } = await supabase
      .from('universal_templates')
      .select('*')
      .eq('category', module)
      .eq('is_active', true)
      .order('usage_count', { ascending: false });

    if (error) throw error;
    return data as UniversalTemplate[];
  }
};
