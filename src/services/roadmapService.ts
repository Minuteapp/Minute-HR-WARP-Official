import { supabase } from '@/integrations/supabase/client';
import { 
  Roadmap, 
  RoadmapMilestone, 
  RoadmapConnection, 
  RoadmapTemplate,
  CreateRoadmapData,
  CreateMilestoneData
} from '@/types/roadmap';

export const roadmapService = {
  // Roadmap CRUD Operations
  async getRoadmaps(): Promise<Roadmap[]> {
    const { data, error } = await supabase
      .from('roadmaps')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getRoadmapById(id: string): Promise<Roadmap | null> {
    const { data, error } = await supabase
      .from('roadmaps')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async createRoadmap(roadmapData: CreateRoadmapData): Promise<Roadmap> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error('Nicht authentifiziert');

    // Company-ID für Schreiboperationen: Tenant-Context (current_tenant_id) hat Vorrang,
    // da RLS (can_write_tenant) genau diesen Context prüft.
    const { data: tenantCompanyId, error: tenantError } = await supabase.rpc('current_tenant_id');

    if (tenantError) {
      throw new Error(`Fehler beim Ermitteln des Tenant-Context: ${tenantError.message}`);
    }

    const { data: fallbackCompanyId, error: companyError } = await supabase.rpc('get_effective_company_id');

    if (companyError) {
      throw new Error(`Fehler beim Ermitteln der Firmen-ID: ${companyError.message}`);
    }

    const companyId = tenantCompanyId ?? fallbackCompanyId;

    if (!companyId) {
      throw new Error('Keine Firma zugeordnet. Bitte kontaktieren Sie den Administrator.');
    }

    const { data, error } = await supabase
      .from('roadmaps')
      .insert({
        ...roadmapData,
        created_by: userData.user.id,
        company_id: companyId,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateRoadmap(id: string, updates: Partial<Roadmap>): Promise<Roadmap> {
    const { data, error } = await supabase
      .from('roadmaps')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteRoadmap(id: string): Promise<void> {
    const { error } = await supabase
      .from('roadmaps')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Milestone Operations
  async getMilestones(roadmapId: string): Promise<RoadmapMilestone[]> {
    const { data, error } = await supabase
      .from('roadmap_milestones')
      .select('*')
      .eq('roadmap_id', roadmapId)
      .order('target_date', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async createMilestone(milestoneData: CreateMilestoneData): Promise<RoadmapMilestone> {
    const { data, error } = await supabase
      .from('roadmap_milestones')
      .insert(milestoneData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateMilestone(id: string, updates: Partial<RoadmapMilestone>): Promise<RoadmapMilestone> {
    const { data, error } = await supabase
      .from('roadmap_milestones')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteMilestone(id: string): Promise<void> {
    const { error } = await supabase
      .from('roadmap_milestones')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Connection Operations
  async getConnections(roadmapId: string): Promise<RoadmapConnection[]> {
    const { data, error } = await supabase
      .from('roadmap_connections')
      .select('*')
      .eq('roadmap_id', roadmapId);

    if (error) throw error;
    return data || [];
  },

  async createConnection(connectionData: Omit<RoadmapConnection, 'id' | 'created_at'>): Promise<RoadmapConnection> {
    const { data, error } = await supabase
      .from('roadmap_connections')
      .insert(connectionData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteConnection(id: string): Promise<void> {
    const { error } = await supabase
      .from('roadmap_connections')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Template Operations
  async getTemplates(): Promise<RoadmapTemplate[]> {
    const { data, error } = await supabase
      .from('roadmap_templates')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async createTemplate(templateData: Omit<RoadmapTemplate, 'id' | 'created_at' | 'updated_at'>): Promise<RoadmapTemplate> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error('Nicht authentifiziert');

    const { data, error } = await supabase
      .from('roadmap_templates')
      .insert({
        ...templateData,
        created_by: userData.user.id,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};