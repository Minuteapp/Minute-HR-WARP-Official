
import { supabase } from "@/integrations/supabase/client";

export interface ProjectActivity {
  id: string;
  project_id: string;
  user_id: string;
  activity_type: string;
  description: string;
  metadata: Record<string, any>;
  created_at: string;
}

export const projectActivityService = {
  // Log einer Projektaktivität
  async logActivity(projectId: string, activityType: string, description: string, metadata: Record<string, any> = {}) {
    console.log('Logging project activity:', { projectId, activityType, description, metadata });
    
    const { data, error } = await supabase.rpc('log_project_activity', {
      p_project_id: projectId,
      p_activity_type: activityType,
      p_description: description,
      p_metadata: metadata
    });

    if (error) {
      console.error('Error logging project activity:', error);
      throw error;
    }

    console.log('Project activity logged successfully:', data);
    return data;
  },

  // Abrufen der Projektaktivitäten
  async getProjectActivities(projectId: string): Promise<ProjectActivity[]> {
    console.log('Fetching project activities for:', projectId);
    
    const { data, error } = await supabase
      .from('project_activities')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching project activities:', error);
      throw error;
    }

    console.log(`Found ${data?.length || 0} activities for project ${projectId}`);
    return data || [];
  },

  // Abrufen aller Aktivitäten für einen Benutzer
  async getUserActivities(userId: string): Promise<ProjectActivity[]> {
    console.log('Fetching user activities for:', userId);
    
    const { data, error } = await supabase
      .from('project_activities')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching user activities:', error);
      throw error;
    }

    console.log(`Found ${data?.length || 0} activities for user ${userId}`);
    return data || [];
  },

  // Abrufen der neuesten Aktivitäten für Dashboard
  async getRecentActivities(limit: number = 10): Promise<ProjectActivity[]> {
    console.log('Fetching recent project activities, limit:', limit);
    
    const { data, error } = await supabase
      .from('project_activities')
      .select(`
        *,
        projects!inner(name)
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching recent activities:', error);
      throw error;
    }

    console.log(`Found ${data?.length || 0} recent activities`);
    return data || [];
  }
};
