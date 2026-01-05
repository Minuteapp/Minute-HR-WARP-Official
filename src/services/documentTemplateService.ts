
import { supabase } from "@/integrations/supabase/client";
import type { 
  DocumentTemplate, 
  DocumentTemplateInstance, 
  DocumentTemplateCategory,
  TemplatePlaceholder 
} from "@/types/documentTemplates";

export const documentTemplateService = {
  // Template-Verwaltung
  async getTemplates(categoryFilter?: string): Promise<DocumentTemplate[]> {
    let query = supabase
      .from('document_templates')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (categoryFilter) {
      query = query.eq('category', categoryFilter);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as DocumentTemplate[];
  },

  async getTemplateById(id: string): Promise<DocumentTemplate> {
    const { data, error } = await supabase
      .from('document_templates')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as DocumentTemplate;
  },

  async createTemplate(template: Partial<DocumentTemplate>): Promise<DocumentTemplate> {
    const { data, error } = await supabase
      .from('document_templates')
      .insert({
        ...template,
        created_by: (await supabase.auth.getUser()).data.user?.id
      })
      .select()
      .single();

    if (error) throw error;
    return data as DocumentTemplate;
  },

  async updateTemplate(id: string, updates: Partial<DocumentTemplate>): Promise<DocumentTemplate> {
    const { data, error } = await supabase
      .from('document_templates')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as DocumentTemplate;
  },

  async deactivateTemplate(id: string): Promise<void> {
    const { error } = await supabase
      .from('document_templates')
      .update({ is_active: false })
      .eq('id', id);

    if (error) throw error;
  },

  // Kategorien-Verwaltung
  async getTemplateCategories(): Promise<DocumentTemplateCategory[]> {
    const { data, error } = await supabase
      .from('document_template_categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order');

    if (error) throw error;
    return data as DocumentTemplateCategory[];
  },

  // Template-Instanzen
  async createTemplateInstance(
    templateId: string, 
    formData?: Record<string, any>,
    placeholderValues?: Record<string, any>
  ): Promise<DocumentTemplateInstance> {
    const { data, error } = await supabase
      .from('document_template_instances')
      .insert({
        template_id: templateId,
        generated_by: (await supabase.auth.getUser()).data.user?.id,
        form_data: formData || {},
        placeholder_values: placeholderValues || {},
        status: 'draft'
      })
      .select()
      .single();

    if (error) throw error;
    return data as DocumentTemplateInstance;
  },

  async getTemplateInstances(templateId?: string): Promise<DocumentTemplateInstance[]> {
    let query = supabase
      .from('document_template_instances')
      .select('*')
      .order('created_at', { ascending: false });

    if (templateId) {
      query = query.eq('template_id', templateId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as DocumentTemplateInstance[];
  },

  async updateTemplateInstance(
    id: string, 
    updates: Partial<DocumentTemplateInstance>
  ): Promise<DocumentTemplateInstance> {
    const { data, error } = await supabase
      .from('document_template_instances')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as DocumentTemplateInstance;
  },

  // Template-Datei Upload
  async uploadTemplateFile(file: File, templateId: string): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const filePath = `templates/${templateId}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    return filePath;
  },

  // Placeholder-Ersetzung für Datei-Templates
  async generateDocumentFromTemplate(
    templateId: string,
    placeholderValues: Record<string, any>
  ): Promise<string> {
    // Diese Funktion würde normalerweise eine Edge Function aufrufen
    // um die Platzhalter in der Template-Datei zu ersetzen
    console.log('Generating document from template:', templateId, placeholderValues);
    throw new Error('Document generation not implemented yet');
  }
};
