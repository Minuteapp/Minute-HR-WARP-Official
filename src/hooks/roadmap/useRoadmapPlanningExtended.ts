import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface RoadmapSubContainer {
  id: string;
  container_id: string;
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  assigned_to?: string[];
  tags?: string[];
  due_date?: string;
  estimated_hours?: number;
  progress?: number;
  position: number;
  color?: string;
  is_visible?: boolean;
  style_settings?: any;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
}

export interface RoadmapTask {
  id: string;
  container_id?: string;
  sub_container_id?: string;
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  assigned_to?: string;
  due_date?: string;
  estimated_hours?: number;
  completed_at?: string;
  position: number;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
}

export interface RoadmapTeamMember {
  id: string;
  container_id: string;
  user_id: string;
  role?: string;
  invited_by?: string;
  invited_at?: string;
  accepted_at?: string;
  status?: string;
  permissions?: any;
}

export interface RoadmapComment {
  id: string;
  container_id?: string;
  sub_container_id?: string;
  author_id: string;
  content: string;
  parent_comment_id?: string;
  created_at?: string;
  updated_at?: string;
}

export const useRoadmapPlanningExtended = (containerId?: string) => {
  const [subContainers, setSubContainers] = useState<RoadmapSubContainer[]>([]);
  const [tasks, setTasks] = useState<RoadmapTask[]>([]);
  const [teamMembers, setTeamMembers] = useState<RoadmapTeamMember[]>([]);
  const [comments, setComments] = useState<RoadmapComment[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Sub-Container laden
  const fetchSubContainers = async () => {
    if (!containerId) return;
    
    try {
      const { data, error } = await supabase
        .from('roadmap_planning_sub_containers')
        .select('*')
        .eq('container_id', containerId)
        .order('position', { ascending: true });

      if (error) throw error;
      setSubContainers(data || []);
    } catch (error) {
      console.error('Fehler beim Laden der Sub-Container:', error);
    }
  };

  // Aufgaben laden
  const fetchTasks = async () => {
    if (!containerId) return;
    
    try {
      const { data, error } = await supabase
        .from('roadmap_planning_tasks')
        .select('*')
        .or(`container_id.eq.${containerId},sub_container_id.in.(${subContainers.map(sc => sc.id).join(',')})`)
        .order('position', { ascending: true });

      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error('Fehler beim Laden der Aufgaben:', error);
    }
  };

  // Team-Mitglieder laden
  const fetchTeamMembers = async () => {
    if (!containerId) return;
    
    try {
      const { data, error } = await supabase
        .from('roadmap_planning_team_members')
        .select('*')
        .eq('container_id', containerId);

      if (error) throw error;
      setTeamMembers(data || []);
    } catch (error) {
      console.error('Fehler beim Laden der Team-Mitglieder:', error);
    }
  };

  // Kommentare laden
  const fetchComments = async () => {
    if (!containerId) return;
    
    try {
      const { data, error } = await supabase
        .from('roadmap_planning_comments')
        .select('*')
        .or(`container_id.eq.${containerId},sub_container_id.in.(${subContainers.map(sc => sc.id).join(',')})`)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error('Fehler beim Laden der Kommentare:', error);
    }
  };

  // Sub-Container erstellen
  const createSubContainer = async (subContainerData: Omit<RoadmapSubContainer, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('roadmap_planning_sub_containers')
        .insert({
          ...subContainerData,
          created_by: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (error) throw error;
      
      setSubContainers(prev => [...prev, data]);
      toast({
        title: "Sub-Container erstellt",
        description: "Der neue Sub-Container wurde erfolgreich erstellt.",
      });
      
      return data;
    } catch (error) {
      console.error('Fehler beim Erstellen des Sub-Containers:', error);
      toast({
        title: "Fehler beim Erstellen",
        description: "Der Sub-Container konnte nicht erstellt werden.",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Aufgabe erstellen
  const createTask = async (taskData: Omit<RoadmapTask, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('roadmap_planning_tasks')
        .insert({
          ...taskData,
          created_by: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (error) throw error;
      
      setTasks(prev => [...prev, data]);
      toast({
        title: "Aufgabe erstellt",
        description: "Die neue Aufgabe wurde erfolgreich erstellt.",
      });
      
      return data;
    } catch (error) {
      console.error('Fehler beim Erstellen der Aufgabe:', error);
      toast({
        title: "Fehler beim Erstellen",
        description: "Die Aufgabe konnte nicht erstellt werden.",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Team-Mitglied einladen
  const inviteTeamMember = async (memberData: Omit<RoadmapTeamMember, 'id' | 'invited_at'>) => {
    try {
      const { data, error } = await supabase
        .from('roadmap_planning_team_members')
        .insert({
          ...memberData,
          invited_by: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (error) throw error;
      
      setTeamMembers(prev => [...prev, data]);
      toast({
        title: "Team-Mitglied eingeladen",
        description: "Das Team-Mitglied wurde erfolgreich eingeladen.",
      });
      
      return data;
    } catch (error) {
      console.error('Fehler beim Einladen des Team-Mitglieds:', error);
      toast({
        title: "Fehler beim Einladen",
        description: "Das Team-Mitglied konnte nicht eingeladen werden.",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Kommentar erstellen
  const createComment = async (commentData: Omit<RoadmapComment, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('roadmap_planning_comments')
        .insert({
          ...commentData,
          author_id: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (error) throw error;
      
      setComments(prev => [...prev, data]);
      toast({
        title: "Kommentar hinzugefügt",
        description: "Der Kommentar wurde erfolgreich hinzugefügt.",
      });
      
      return data;
    } catch (error) {
      console.error('Fehler beim Erstellen des Kommentars:', error);
      toast({
        title: "Fehler beim Kommentieren",
        description: "Der Kommentar konnte nicht erstellt werden.",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Update-Funktionen
  const updateSubContainer = async (id: string, updates: Partial<RoadmapSubContainer>) => {
    try {
      const { data, error } = await supabase
        .from('roadmap_planning_sub_containers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setSubContainers(prev => prev.map(item => item.id === id ? data : item));
      return data;
    } catch (error) {
      console.error('Fehler beim Aktualisieren des Sub-Containers:', error);
      throw error;
    }
  };

  const updateTask = async (id: string, updates: Partial<RoadmapTask>) => {
    try {
      const { data, error } = await supabase
        .from('roadmap_planning_tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setTasks(prev => prev.map(item => item.id === id ? data : item));
      return data;
    } catch (error) {
      console.error('Fehler beim Aktualisieren der Aufgabe:', error);
      throw error;
    }
  };

  // Delete-Funktionen
  const deleteSubContainer = async (id: string) => {
    try {
      const { error } = await supabase
        .from('roadmap_planning_sub_containers')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setSubContainers(prev => prev.filter(item => item.id !== id));
      toast({
        title: "Sub-Container gelöscht",
        description: "Der Sub-Container wurde erfolgreich gelöscht.",
      });
    } catch (error) {
      console.error('Fehler beim Löschen des Sub-Containers:', error);
      toast({
        title: "Fehler beim Löschen",
        description: "Der Sub-Container konnte nicht gelöscht werden.",
        variant: "destructive",
      });
    }
  };

  const deleteTask = async (id: string) => {
    try {
      const { error } = await supabase
        .from('roadmap_planning_tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setTasks(prev => prev.filter(item => item.id !== id));
      toast({
        title: "Aufgabe gelöscht",
        description: "Die Aufgabe wurde erfolgreich gelöscht.",
      });
    } catch (error) {
      console.error('Fehler beim Löschen der Aufgabe:', error);
      toast({
        title: "Fehler beim Löschen",
        description: "Die Aufgabe konnte nicht gelöscht werden.",
        variant: "destructive",
      });
    }
  };

  // Daten laden wenn containerId sich ändert
  useEffect(() => {
    if (containerId) {
      setIsLoading(true);
      Promise.all([
        fetchSubContainers(),
        fetchTeamMembers()
      ]).finally(() => {
        setIsLoading(false);
      });
    }
  }, [containerId]);

  // Tasks und Comments laden wenn Sub-Container geladen sind
  useEffect(() => {
    if (containerId && subContainers.length >= 0) {
      fetchTasks();
      fetchComments();
    }
  }, [containerId, subContainers]);

  return {
    subContainers,
    tasks,
    teamMembers,
    comments,
    isLoading,
    createSubContainer,
    createTask,
    inviteTeamMember,
    createComment,
    updateSubContainer,
    updateTask,
    deleteSubContainer,
    deleteTask,
    refetch: () => {
      if (containerId) {
        fetchSubContainers();
        fetchTasks();
        fetchTeamMembers();
        fetchComments();
      }
    }
  };
};