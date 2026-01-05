
import { supabase } from "@/integrations/supabase/client";
import type { 
  ForecastTemplate,
  CreateForecastTemplateRequest,
  ForecastInstance
} from "@/types/forecastTemplates";

export const forecastTemplateService = {
  async getForecastTemplates(filters?: {
    category?: string;
    department?: string;
    is_active?: boolean;
  }) {
    let query = supabase.from('budget_templates').select('*');
    
    if (filters?.category) {
      query = query.eq('template_type', filters.category);
    }
    if (filters?.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    
    // Transform to ForecastTemplate format
    return (data || []).map(template => ({
      id: template.id,
      name: template.name,
      description: template.description,
      category: template.template_type as ForecastTemplate['category'],
      forecast_type: 'monthly' as const,
      template_data: template.fields || {},
      is_default: false,
      is_locked: false,
      is_active: template.is_active,
      access_level: 'admin' as const,
      version: 1,
      created_by: template.created_by || '',
      created_at: template.created_at,
      updated_at: template.updated_at,
      usage_count: 0
    })) as ForecastTemplate[];
  },

  async createForecastTemplate(request: CreateForecastTemplateRequest) {
    console.log('Creating forecast template with request:', request);
    
    const { data: { user } } = await supabase.auth.getUser();
    console.log('Current user:', user?.id);
    
    if (!user?.id) {
      throw new Error('Benutzer nicht authentifiziert');
    }

    const insertData = {
      name: request.name,
      description: request.description,
      template_type: request.category,
      fields: request.template_data,
      created_by: user.id
    };
    
    console.log('Inserting data:', insertData);
    
    const { data, error } = await supabase
      .from('budget_templates')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      throw new Error(`Fehler beim Erstellen der Vorlage: ${error.message}`);
    }
    
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      category: data.template_type as ForecastTemplate['category'],
      forecast_type: request.forecast_type,
      template_data: request.template_data,
      is_default: false,
      is_locked: false,
      is_active: true,
      access_level: 'admin' as const,
      version: 1,
      created_by: data.created_by || '',
      created_at: data.created_at,
      updated_at: data.updated_at,
      usage_count: 0
    } as ForecastTemplate;
  },

  async getForecastInstances(templateId?: string) {
    let query = supabase.from('enterprise_forecasts').select('*');
    
    if (templateId) {
      query = query.eq('base_forecast_id', templateId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    
    return (data || []).map(forecast => ({
      id: forecast.id,
      template_id: forecast.base_forecast_id || '',
      name: forecast.forecast_name,
      forecast_period_start: forecast.forecast_period_start,
      forecast_period_end: forecast.forecast_period_end,
      scenario_applied: forecast.scenario_type,
      parameter_overrides: forecast.manual_adjustments || {},
      calculated_data: forecast.predicted_values || [],
      status: forecast.status as ForecastInstance['status'],
      created_by: forecast.created_by || '',
      created_at: forecast.created_at,
      updated_at: forecast.updated_at
    })) as ForecastInstance[];
  },

  async createForecastInstance(instanceData: Partial<ForecastInstance>) {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('enterprise_forecasts')
      .insert({
        forecast_name: instanceData.name || 'Neuer Forecast',
        forecast_type: 'linear',
        base_forecast_id: instanceData.template_id,
        forecast_period_start: instanceData.forecast_period_start,
        forecast_period_end: instanceData.forecast_period_end,
        scenario_type: instanceData.scenario_applied || 'realistic',
        manual_adjustments: instanceData.parameter_overrides || {},
        predicted_values: instanceData.calculated_data || [],
        created_by: user?.id
      })
      .select()
      .single();

    if (error) throw error;
    
    return {
      id: data.id,
      template_id: data.base_forecast_id || '',
      name: data.forecast_name,
      forecast_period_start: data.forecast_period_start,
      forecast_period_end: data.forecast_period_end,
      scenario_applied: data.scenario_type,
      parameter_overrides: data.manual_adjustments || {},
      calculated_data: data.predicted_values || [],
      status: data.status as ForecastInstance['status'],
      created_by: data.created_by || '',
      created_at: data.created_at,
      updated_at: data.updated_at
    } as ForecastInstance;
  }
};
