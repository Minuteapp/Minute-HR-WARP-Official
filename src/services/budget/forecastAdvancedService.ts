
import { supabase } from "@/integrations/supabase/client";
import type { 
  ForecastScenario,
  ForecastAIRecommendation,
  ForecastRiskAssessment,
  ForecastDataConnector
} from "@/types/forecastAdvanced";

export const forecastAdvancedService = {
  // Forecast Szenarien
  async getScenarios(templateId?: string) {
    let query = supabase.from('budget_scenarios').select('*');
    
    if (templateId) {
      query = query.eq('base_forecast_id', templateId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data as ForecastScenario[];
  },

  async createScenario(scenario: Partial<ForecastScenario>) {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('budget_scenarios')
      .insert({
        ...scenario,
        created_by: user?.id,
        scenario_status: 'draft'
      })
      .select()
      .single();

    if (error) throw error;
    return data as ForecastScenario;
  },

  async updateScenario(id: string, updates: Partial<ForecastScenario>) {
    const { data, error } = await supabase
      .from('budget_scenarios')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as ForecastScenario;
  },

  // KI-Empfehlungen
  async getAIRecommendations(forecastInstanceId?: string) {
    let query = supabase.from('ai_budget_insights').select('*');
    
    if (forecastInstanceId) {
      query = query.eq('affected_budget_id', forecastInstanceId);
    }

    const { data, error } = await query
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) throw error;
    return data as ForecastAIRecommendation[];
  },

  async updateRecommendationStatus(id: string, status: string) {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('ai_budget_insights')
      .update({
        status,
        acknowledged_by: user?.id,
        acknowledged_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Risikobewertung
  async getRiskAssessments(forecastInstanceId?: string) {
    let query = supabase.from('ai_budget_insights').select('*')
      .eq('insight_type', 'anomaly_detected');
    
    if (forecastInstanceId) {
      query = query.eq('affected_budget_id', forecastInstanceId);
    }

    const { data, error } = await query.order('severity', { ascending: false });
    if (error) throw error;
    return data as ForecastRiskAssessment[];
  },

  async updateRiskStatus(id: string, status: string, resolutionNotes?: string) {
    const { data: { user } } = await supabase.auth.getUser();
    
    const updateData: any = {
      status,
      acknowledged_by: user?.id,
      acknowledged_at: new Date().toISOString()
    };

    if (resolutionNotes) {
      updateData.resolution_notes = resolutionNotes;
    }

    const { data, error } = await supabase
      .from('ai_budget_insights')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Daten-Konnektoren
  async getDataConnectors() {
    // Simuliere Daten-Konnektoren (da keine echte Tabelle in der Migration)
    return [
      {
        id: '1',
        name: 'Zeiterfassung Integration',
        connector_type: 'hr' as const,
        sync_status: 'active' as const,
        last_sync_at: new Date().toISOString(),
        is_active: true
      },
      {
        id: '2',
        name: 'Projektdaten Import',
        connector_type: 'project' as const,
        sync_status: 'active' as const,
        last_sync_at: new Date().toISOString(),
        is_active: true
      }
    ] as ForecastDataConnector[];
  },

  async syncDataConnector(id: string) {
    // Simuliere Synchronisation
    console.log(`Synchronisiere Daten-Konnektor ${id}`);
    return { success: true, message: 'Synchronisation erfolgreich' };
  },

  // Budget Actual Data Import
  async importActualData(batchData: {
    file_name: string;
    file_type: string;
    data: any[];
    mapping_rules: Record<string, string>;
  }) {
    const { data: { user } } = await supabase.auth.getUser();

    // Batch erstellen
    const { data: batch, error: batchError } = await supabase
      .from('budget_upload_batches')
      .insert({
        file_name: batchData.file_name,
        file_type: batchData.file_type,
        upload_type: 'budget_actuals',
        total_rows: batchData.data.length,
        mapping_rules: batchData.mapping_rules,
        uploaded_by: user?.id
      })
      .select()
      .single();

    if (batchError) throw batchError;

    // Daten verarbeiten und einfügen
    const actualEntries = batchData.data.map((row: any) => ({
      entry_date: row.date,
      amount: parseFloat(row.amount) || 0,
      currency: row.currency || 'EUR',
      dimension_type: row.dimension_type || 'department',
      dimension_id: row.dimension_id,
      category: row.category || 'expense',
      subcategory: row.subcategory,
      description: row.description,
      source_type: 'excel_upload',
      source_file_name: batchData.file_name,
      upload_batch_id: batch.id,
      created_by: user?.id
    }));

    const { data: entries, error: entriesError } = await supabase
      .from('budget_actual_entries')
      .insert(actualEntries)
      .select();

    if (entriesError) {
      // Update batch mit Fehlerstatus
      await supabase
        .from('budget_upload_batches')
        .update({
          processing_status: 'failed',
          validation_errors: [entriesError.message]
        })
        .eq('id', batch.id);
      throw entriesError;
    }

    // Update batch mit Erfolgsstatus
    await supabase
      .from('budget_upload_batches')
      .update({
        processing_status: 'completed',
        processed_rows: entries?.length || 0,
        successful_rows: entries?.length || 0,
        processed_at: new Date().toISOString()
      })
      .eq('id', batch.id);

    return { batch, entries };
  }
};
