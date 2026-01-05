
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface Team {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  status: string;
  department?: string;
  parent_team_id?: string;
  metadata?: Record<string, any>;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: string;
  joined_at: string;
}

export const teamService = {
  async createTeam(data: Omit<Team, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const { data: team, error } = await supabase
        .from('teams')
        .insert([data])
        .select()
        .single();

      if (error) throw error;

      toast({
        description: "Team wurde erfolgreich erstellt",
      });

      return team;
    } catch (error: any) {
      console.error('Error creating team:', error);
      toast({
        description: "Team konnte nicht erstellt werden: " + error.message,
        variant: "destructive",
      });
      throw error;
    }
  },

  async getTeam(id: string) {
    try {
      const { data: team, error } = await supabase
        .from('teams')
        .select('*, team_members(*)')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;

      return team;
    } catch (error: any) {
      console.error('Error fetching team:', error);
      toast({
        description: "Team konnte nicht geladen werden: " + error.message,
        variant: "destructive",
      });
      throw error;
    }
  },

  async updateTeam(id: string, data: Partial<Team>) {
    try {
      const { data: team, error } = await supabase
        .from('teams')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      toast({
        description: "Team wurde erfolgreich aktualisiert",
      });

      return team;
    } catch (error: any) {
      console.error('Error updating team:', error);
      toast({
        description: "Team konnte nicht aktualisiert werden: " + error.message,
        variant: "destructive",
      });
      throw error;
    }
  },

  async deleteTeam(id: string) {
    try {
      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        description: "Team wurde erfolgreich gelöscht",
      });
    } catch (error: any) {
      console.error('Error deleting team:', error);
      toast({
        description: "Team konnte nicht gelöscht werden: " + error.message,
        variant: "destructive",
      });
      throw error;
    }
  },

  async getAllTeams() {
    try {
      const { data: teams, error } = await supabase
        .from('teams')
        .select('*')
        .order('name');

      if (error) throw error;

      return teams;
    } catch (error: any) {
      console.error('Error fetching teams:', error);
      toast({
        description: "Teams konnten nicht geladen werden: " + error.message,
        variant: "destructive",
      });
      throw error;
    }
  },

  async addTeamMember(teamId: string, userId: string, role: string = 'member') {
    try {
      const { data: member, error } = await supabase
        .from('team_members')
        .insert([{
          team_id: teamId,
          user_id: userId,
          role
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        description: "Mitglied wurde erfolgreich zum Team hinzugefügt",
      });

      return member;
    } catch (error: any) {
      console.error('Error adding team member:', error);
      toast({
        description: "Mitglied konnte nicht hinzugefügt werden: " + error.message,
        variant: "destructive",
      });
      throw error;
    }
  },

  async removeTeamMember(teamId: string, userId: string) {
    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('team_id', teamId)
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        description: "Mitglied wurde erfolgreich aus dem Team entfernt",
      });
    } catch (error: any) {
      console.error('Error removing team member:', error);
      toast({
        description: "Mitglied konnte nicht entfernt werden: " + error.message,
        variant: "destructive",
      });
      throw error;
    }
  },

  async getTeamMembers(teamId: string) {
    try {
      const { data: members, error } = await supabase
        .from('team_members')
        .select(`
          *,
          profiles:user_id (
            id,
            full_name,
            avatar_url
          )
        `)
        .eq('team_id', teamId);

      if (error) throw error;

      return members;
    } catch (error: any) {
      console.error('Error fetching team members:', error);
      toast({
        description: "Teammitglieder konnten nicht geladen werden: " + error.message,
        variant: "destructive",
      });
      throw error;
    }
  }
};
