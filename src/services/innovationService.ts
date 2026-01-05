
import { supabase } from '@/integrations/supabase/client';
import { IdeaFormData, InnovationChannel, PilotProject, IdeaVote, IdeaComment, InnovationStatistics, KITestFeature, IdeaStatus } from '@/types/innovation';
// import { TenantAwareQuery } from '@/utils/tenantAwareQuery';

export const innovationService = {
  // Ideas
  async createIdea(ideaData: IdeaFormData) {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    // company_id über RPC ermitteln (unterstützt Tenant-Modus)
    const { data: companyId } = await supabase.rpc('get_effective_company_id');
    
    if (!companyId) {
      throw new Error('Bitte wählen Sie eine Firma aus oder wechseln Sie in den Tenant-Modus.');
    }

    const { data, error } = await supabase
      .from('innovation_ideas')
      .insert([{
        title: ideaData.title,
        description: ideaData.description,
        tags: ideaData.tags,
        submitter_id: user.id,
        status: 'new',
        company_id: companyId
      }])
      .select()
      .single();

    if (error) throw error;

    // Trigger AI analysis automatically
    try {
      console.log('🚀 Triggering AI analysis for idea:', data.id);
      
      await supabase.functions.invoke('innovation-ai-analysis', {
        body: {
          ideaId: data.id,
          title: ideaData.title,
          description: ideaData.description,
          tags: ideaData.tags
        }
      });
      
      console.log('✅ AI analysis triggered successfully');
    } catch (analysisError) {
      console.warn('⚠️ Failed to trigger AI analysis:', analysisError);
      // Don't throw here - idea creation should still succeed
    }

    return data;
  },

  async getIdeas(filters?: { channel_id?: string; status?: string; search?: string }) {
    // const tenantQuery = new TenantAwareQuery('innovation_ideas');
    let query = supabase
      .from('innovation_ideas')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async updateIdeaStatus(ideaId: string, status: string) {
    const { data, error } = await supabase
      .from('innovation_ideas')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', ideaId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Channels
  async createChannel(channelData: Omit<InnovationChannel, 'id' | 'created_at' | 'updated_at' | 'ideas_count' | 'pilot_projects_count'>) {
    // Da innovation_channels Tabelle noch nicht existiert, erstellen wir Mock-Channel
    return {
      id: crypto.randomUUID(),
      ...channelData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ideas_count: 0,
      pilot_projects_count: 0
    };
  },

  async getChannels() {
    // Da innovation_channels Tabelle noch nicht existiert, geben wir leeres Array zurück
    return [];
  },

  // Pilot Projects
  async createPilotProject(projectData: Omit<PilotProject, 'id' | 'created_at' | 'updated_at'>) {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    // company_id über RPC ermitteln (unterstützt Tenant-Modus)
    const { data: companyId } = await supabase.rpc('get_effective_company_id');
    
    if (!companyId) {
      throw new Error('Bitte wählen Sie eine Firma aus oder wechseln Sie in den Tenant-Modus.');
    }

    const { data, error } = await supabase
      .from('pilot_projects')
      .insert([{
        title: projectData.title,
        description: projectData.description,
        idea_id: projectData.idea_id,
        status: projectData.status || 'preparing',
        start_date: projectData.start_date,
        end_date: projectData.end_date,
        budget: projectData.budget,
        success_metrics: projectData.success_metrics || [],
        responsible_person: projectData.responsible_person,
        team_members: projectData.team_members || [],
        progress: projectData.progress || 0,
        risk_assessment: projectData.risk_assessment,
        learnings: projectData.learnings,
        next_steps: projectData.next_steps,
        attachments: projectData.attachments || [],
        created_by: user.id,
        company_id: companyId
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getPilotProjects() {
    // const tenantQuery = new TenantAwareQuery('pilot_projects');
    const { data, error } = await supabase
      .from('pilot_projects')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async updatePilotProject(projectId: string, updates: Partial<PilotProject>) {
    const { data, error } = await supabase
      .from('pilot_projects')
      .update(updates)
      .eq('id', projectId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deletePilotProject(projectId: string) {
    const { error } = await supabase
      .from('pilot_projects')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', projectId);

    if (error) throw error;
  },

  // Voting
  async voteIdea(ideaId: string, voteType: 'upvote' | 'downvote') {
    const user = await supabase.auth.getUser();
    if (!user.data.user?.id) throw new Error('User not authenticated');

    // Check if user already voted
    const { data: existingVote } = await supabase
      .from('innovation_votes')
      .select('id, vote_type')
      .eq('idea_id', ideaId)
      .eq('voter_id', user.data.user.id)
      .single();

    if (existingVote) {
      if (existingVote.vote_type === voteType) {
        // Remove vote if same type
        const { error } = await supabase
          .from('innovation_votes')
          .delete()
          .eq('id', existingVote.id);
        if (error) throw error;
      } else {
        // Update vote type
        const { error } = await supabase
          .from('innovation_votes')
          .update({ vote_type: voteType })
          .eq('id', existingVote.id);
        if (error) throw error;
      }
    } else {
      // Create new vote
      const { error } = await supabase
        .from('innovation_votes')
        .insert([{
          idea_id: ideaId,
          voter_id: user.data.user.id,
          vote_type: voteType,
          score: voteType === 'upvote' ? 5 : 1
        }]);
      if (error) throw error;
    }

    // Update idea votes count
    await this.updateIdeaVotesCount(ideaId);
  },

  async updateIdeaVotesCount(ideaId: string) {
    // Da votes_count Spalte nicht existiert, überspringen wir die Aktualisierung
    // Dies kann später implementiert werden, wenn die Spalte hinzugefügt wird
    console.log('updateIdeaVotesCount: Skipping votes count update for idea', ideaId);
  },

  // Comments
  async addComment(ideaId: string, content: string, isPrivate: boolean = false) {
    const user = await supabase.auth.getUser();
    if (!user.data.user?.id) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('innovation_comments')
      .insert([{
        idea_id: ideaId,
        commenter_id: user.data.user.id,
        comment_text: content
      }])
      .select(`
        *
      `)
      .single();

    if (error) throw error;
    return data;
  },

  async getComments(ideaId: string) {
    const { data, error } = await supabase
      .from('innovation_comments')
      .select(`
        *
      `)
      .eq('idea_id', ideaId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  // Statistics
  async getStatistics(): Promise<InnovationStatistics> {
    try {
      const [
        ideasTotal,
        ideasThisMonth,
        implementedIdeas,
        activePilotProjects,
        ideasByStatus
      ] = await Promise.all([
        supabase.from('innovation_ideas').select('id', { count: 'exact' }).is('deleted_at', null),
        supabase.from('innovation_ideas').select('id', { count: 'exact' })
          .is('deleted_at', null)
          .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
        supabase.from('innovation_ideas').select('id', { count: 'exact' })
          .is('deleted_at', null)
          .eq('status', 'implemented'),
        supabase.from('pilot_projects').select('id', { count: 'exact' })
          .is('deleted_at', null)
          .in('status', ['preparing', 'pilot_phase', 'scaling']),
        supabase.from('innovation_ideas').select('status').is('deleted_at', null)
      ]);

      const statusCounts = ideasByStatus.data?.reduce((acc: Record<string, number>, idea: any) => {
        acc[idea.status] = (acc[idea.status] || 0) + 1;
        return acc;
      }, {}) || {};

      return {
        total_ideas: ideasTotal.count || 0,
        ideas_this_month: ideasThisMonth.count || 0,
        implemented_ideas: implementedIdeas.count || 0,
        active_pilot_projects: activePilotProjects.count || 0,
        participation_rate: 0,
        top_contributors: [],
        ideas_by_status: statusCounts as Record<string, number>,
        ideas_by_channel: []
      };
    } catch (error) {
      console.error('Error fetching statistics:', error);
      const defaultIdeasByStatus: Record<IdeaStatus, number> = {
        new: 0,
        under_review: 0,
        approved: 0,
        in_development: 0,
        pilot_phase: 0,
        implemented: 0,
        rejected: 0,
        archived: 0
      };
      
      return {
        total_ideas: 0,
        ideas_this_month: 0,
        implemented_ideas: 0,
        active_pilot_projects: 0,
        participation_rate: 0,
        top_contributors: [],
        ideas_by_status: defaultIdeasByStatus,
        ideas_by_channel: []
      };
    }
  },

  // KI Test Features
  async getKITestFeatures() {
    const { data, error } = await supabase
      .from('ki_test_features')
      .select('*')
      .order('name');

    if (error) throw error;
    return data || [];
  },

  async toggleKIFeature(featureId: string, enabled: boolean) {
    const { data, error } = await supabase
      .from('ki_test_features')
      .update({ is_enabled: enabled })
      .eq('id', featureId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // AI Analysis
  async getIdeaAnalysis(ideaId: string) {
    const { data, error } = await supabase
      .from('innovation_ai_insights')
      .select('*')
      .eq('idea_id', ideaId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async triggerIdeaAnalysis(ideaId: string, title: string, description: string, tags?: string[]) {
    const { data, error } = await supabase.functions.invoke('innovation-ai-analysis', {
      body: {
        ideaId,
        title,
        description,
        tags: tags || []
      }
    });

    if (error) throw error;
    return data;
  }
};
