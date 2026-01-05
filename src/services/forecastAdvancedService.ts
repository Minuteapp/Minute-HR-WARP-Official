
import { supabase } from '@/integrations/supabase/client';
import type {
  ForecastScenario,
  ForecastAIRecommendation,
  ForecastRiskAssessment,
  ForecastDataConnector
} from '@/types/forecastAdvanced';

export const forecastAdvancedService = {
  // Szenarien-Management
  async getScenarios(templateId?: string): Promise<ForecastScenario[]> {
    let query = supabase
      .from('forecast_scenarios')
      .select('*')
      .eq('is_active', true);
    
    if (templateId) {
      query = query.eq('base_template_id', templateId);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async createScenario(scenario: Partial<ForecastScenario>): Promise<ForecastScenario> {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('forecast_scenarios')
      .insert([{ 
        ...scenario, 
        created_by: user?.id 
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateScenario(id: string, updates: Partial<ForecastScenario>): Promise<ForecastScenario> {
    const { data, error } = await supabase
      .from('forecast_scenarios')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteScenario(id: string): Promise<void> {
    const { error } = await supabase
      .from('forecast_scenarios')
      .update({ is_active: false })
      .eq('id', id);
    
    if (error) throw error;
  },

  // KI-Empfehlungen
  async getAIRecommendations(forecastInstanceId?: string): Promise<ForecastAIRecommendation[]> {
    let query = supabase
      .from('forecast_ai_recommendations')
      .select('*');
    
    if (forecastInstanceId) {
      query = query.eq('forecast_instance_id', forecastInstanceId);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async updateRecommendationStatus(id: string, status: string): Promise<ForecastAIRecommendation> {
    const { data, error } = await supabase
      .from('forecast_ai_recommendations')
      .update({ 
        status,
        reviewed_by: (await supabase.auth.getUser()).data.user?.id,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Risikobewertung
  async getRiskAssessments(forecastInstanceId?: string): Promise<ForecastRiskAssessment[]> {
    let query = supabase
      .from('forecast_risk_assessments')
      .select('*')
      .eq('status', 'active');
    
    if (forecastInstanceId) {
      query = query.eq('forecast_instance_id', forecastInstanceId);
    }
    
    const { data, error } = await query.order('severity', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async updateRiskStatus(id: string, status: string, resolutionNotes?: string): Promise<ForecastRiskAssessment> {
    const updates: any = { status };
    
    if (status === 'mitigated' || status === 'resolved') {
      updates.resolved_at = new Date().toISOString();
    }
    
    const { data, error } = await supabase
      .from('forecast_risk_assessments')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Daten-Konnektoren
  async getDataConnectors(): Promise<ForecastDataConnector[]> {
    const { data, error } = await supabase
      .from('forecast_data_connectors')
      .select('*')
      .eq('is_active', true)
      .order('name');
    
    if (error) throw error;
    return data || [];
  },

  async syncDataConnector(id: string): Promise<void> {
    const { error } = await supabase
      .from('forecast_data_connectors')
      .update({ 
        last_sync_at: new Date().toISOString(),
        sync_status: 'active'
      })
      .eq('id', id);
    
    if (error) throw error;
  },

  // Rollenbasierte Berechtigungen
  async checkPermission(userId: string, permissionType: string, resourceType: string, resourceId?: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('forecast_permissions')
      .select('*')
      .eq('user_id', userId)
      .eq('permission_type', permissionType)
      .eq('resource_type', resourceType)
      .eq('is_active', true);
    
    if (error) return false;
    
    // Globale Berechtigung oder spezifische Ressource
    return data.some(permission => 
      !permission.resource_id || permission.resource_id === resourceId
    );
  }
};
