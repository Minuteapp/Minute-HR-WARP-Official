
import { supabase } from "@/integrations/supabase/client";
import { forecastTemplateService } from "../forecastTemplateService";
import { forecastAdvancedService } from "./forecastAdvancedService";
import type { 
  EnterpriseForcast,
  CreateEnterpriseForcastRequest,
  ForecastTemplate,
  ForecastInstance
} from "@/types/budgetEnterprise";
import type { 
  CreateForecastTemplateRequest as ForecastTemplateCreateRequest,
  ForecastTemplateData
} from "@/types/forecastTemplates";

export const forecastService = {
  ...forecastTemplateService,
  ...forecastAdvancedService,

  async getEnterpriseForecasts(filters?: {
    dimension_type?: string;
    scenario_type?: string;
    status?: string;
  }) {
    let query = supabase.from('enterprise_forecasts').select('*');
    
    if (filters?.dimension_type) {
      query = query.eq('dimension_type', filters.dimension_type);
    }
    if (filters?.scenario_type) {
      query = query.eq('scenario_type', filters.scenario_type);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data as EnterpriseForcast[];
  },

  async createEnterpriseForecast(request: CreateEnterpriseForcastRequest) {
    const { data: { user } } = await supabase.auth.getUser();
    
    // Stelle sicher, dass alle required Felder gesetzt sind
    const forecastData = {
      ...request,
      created_by: user?.id,
      status: 'draft',
      base_period_start: request.forecast_period_start,
      base_period_end: request.forecast_period_end
    };
    
    const { data, error } = await supabase
      .from('enterprise_forecasts')
      .insert(forecastData)
      .select()
      .single();

    if (error) throw error;
    return data as EnterpriseForcast;
  },

  // Template-Management-Methoden
  async getTemplates(filters?: {
    category?: string;
    department?: string;
    is_active?: boolean;
  }) {
    return forecastTemplateService.getForecastTemplates(filters);
  },

  async getTemplateById(id: string) {
    const templates = await this.getTemplates();
    return templates.find(t => t.id === id) || null;
  },

  async createTemplate(template: ForecastTemplateCreateRequest) {
    // Korrigiere die Template-Daten-Struktur
    const templateData: ForecastTemplateData = {
      structure: template.template_data?.structure || [],
      parameters: template.template_data?.parameters || [],
      scenarios: template.template_data?.scenarios || [],
      formulas: template.template_data?.formulas || []
    };

    const correctedTemplate: ForecastTemplateCreateRequest = {
      ...template,
      template_data: templateData
    };

    return forecastTemplateService.createForecastTemplate(correctedTemplate);
  },

  async updateTemplate(id: string, updates: Partial<ForecastTemplate>) {
    // Implementierung für Update
    console.log('Updating template:', id, updates);
    return Promise.resolve(updates);
  },

  async duplicateTemplate(id: string, newName: string) {
    const original = await this.getTemplateById(id);
    if (!original) throw new Error('Template not found');
    
    return this.createTemplate({
      name: newName,
      description: original.description,
      category: original.category,
      forecast_type: original.forecast_type,
      template_data: original.template_data
    });
  },

  async setAsDefault(id: string, category: string) {
    console.log('Setting template as default:', id, category);
    return Promise.resolve({ success: true });
  },

  async lockTemplate(id: string, locked: boolean) {
    console.log('Locking template:', id, locked);
    return Promise.resolve({ success: true });
  },

  async createForecastFromTemplate(templateId: string, params: {
    name: string;
    period_start: string;
    period_end: string;
    scenario?: string;
    parameter_overrides?: Record<string, number>;
  }) {
    return forecastTemplateService.createForecastInstance({
      template_id: templateId,
      name: params.name,
      forecast_period_start: params.period_start,
      forecast_period_end: params.period_end,
      scenario_applied: params.scenario,
      parameter_overrides: params.parameter_overrides || {}
    });
  },

  async getForecastInstances(templateId?: string) {
    return forecastTemplateService.getForecastInstances(templateId);
  }
};
