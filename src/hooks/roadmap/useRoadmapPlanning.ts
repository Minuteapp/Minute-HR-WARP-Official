import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface RoadmapBoard {
  id: string;
  roadmap_id: string;
  title: string;
  description?: string;
  settings?: any;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
}

export interface RoadmapContainer {
  id: string;
  board_id: string;
  title: string;
  description?: string;
  position: number;
  color?: string;
  status?: string;
  priority?: string;
  assigned_to?: string[];
  tags?: string[];
  due_date?: string;
  estimated_hours?: number;
  progress?: number;
  font_size?: number;
  has_sub_containers?: boolean;
  sub_containers_visible?: boolean;
  settings?: any;
  metadata?: any;
  created_at?: string;
  updated_at?: string;
}

export interface RoadmapCard {
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
  style_settings?: any;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
}

export interface RoadmapSubtask {
  id: string;
  card_id: string;
  title: string;
  completed?: boolean;
  assigned_to?: string;
  due_date?: string;
  position: number;
  created_at?: string;
  updated_at?: string;
}

export interface RoadmapComment {
  id: string;
  card_id: string;
  author_id: string;
  content: string;
  created_at?: string;
  updated_at?: string;
}

export const useRoadmapPlanning = (roadmapId?: string) => {
  const [boards, setBoards] = useState<RoadmapBoard[]>([]);
  const [containers, setContainers] = useState<RoadmapContainer[]>([]);
  const [cards, setCards] = useState<RoadmapCard[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Lade alle Boards für eine Roadmap
  const fetchBoards = async () => {
    if (!roadmapId) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('roadmap_planning_boards')
        .select('*')
        .eq('roadmap_id', roadmapId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setBoards(data || []);
    } catch (error) {
      console.error('Fehler beim Laden der Boards:', error);
      toast({
        title: "Fehler beim Laden der Boards",
        description: "Die Boards konnten nicht geladen werden.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Lade alle Container für die geladenen Boards
  const fetchContainers = async (boardIds: string[]) => {
    if (boardIds.length === 0) return;

    try {
      const { data, error } = await supabase
        .from('roadmap_planning_containers')
        .select('*')
        .in('board_id', boardIds)
        .order('position', { ascending: true });

      if (error) throw error;
      setContainers(data || []);
    } catch (error) {
      console.error('Fehler beim Laden der Container:', error);
    }
  };

  // Lade alle Cards für die geladenen Container
  const fetchCards = async (containerIds: string[]) => {
    if (containerIds.length === 0) return;

    try {
      const { data, error } = await supabase
        .from('roadmap_planning_cards')
        .select('*')
        .in('container_id', containerIds)
        .order('position', { ascending: true });

      if (error) throw error;
      setCards(data || []);
    } catch (error) {
      console.error('Fehler beim Laden der Cards:', error);
    }
  };

  // Board erstellen
  const createBoard = async (boardData: Omit<RoadmapBoard, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('roadmap_planning_boards')
        .insert({
          ...boardData,
          created_by: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (error) throw error;
      
      setBoards(prev => [...prev, data]);
      toast({
        title: "Board erstellt",
        description: "Das neue Board wurde erfolgreich erstellt.",
      });
      
      return data;
    } catch (error) {
      console.error('Fehler beim Erstellen des Boards:', error);
      toast({
        title: "Fehler beim Erstellen",
        description: "Das Board konnte nicht erstellt werden.",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Container erstellen
  const createContainer = async (containerData: Omit<RoadmapContainer, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('roadmap_planning_containers')
        .insert(containerData)
        .select()
        .single();

      if (error) throw error;
      
      setContainers(prev => [...prev, data]);
      toast({
        title: "Container erstellt",
        description: "Der neue Container wurde erfolgreich erstellt.",
      });
      
      return data;
    } catch (error) {
      console.error('Fehler beim Erstellen des Containers:', error);
      toast({
        title: "Fehler beim Erstellen",
        description: "Der Container konnte nicht erstellt werden.",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Card erstellen
  const createCard = async (cardData: Omit<RoadmapCard, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('roadmap_planning_cards')
        .insert({
          ...cardData,
          created_by: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (error) throw error;
      
      setCards(prev => [...prev, data]);
      toast({
        title: "Karte erstellt",
        description: "Die neue Karte wurde erfolgreich erstellt.",
      });
      
      return data;
    } catch (error) {
      console.error('Fehler beim Erstellen der Karte:', error);
      toast({
        title: "Fehler beim Erstellen",
        description: "Die Karte konnte nicht erstellt werden.",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Card aktualisieren
  const updateCard = async (cardId: string, updates: Partial<RoadmapCard>) => {
    try {
      const { data, error } = await supabase
        .from('roadmap_planning_cards')
        .update(updates)
        .eq('id', cardId)
        .select()
        .single();

      if (error) throw error;
      
      setCards(prev => prev.map(card => card.id === cardId ? data : card));
      return data;
    } catch (error) {
      console.error('Fehler beim Aktualisieren der Karte:', error);
      throw error;
    }
  };

  // Container aktualisieren
  const updateContainer = async (containerId: string, updates: Partial<RoadmapContainer>) => {
    try {
      const { data, error } = await supabase
        .from('roadmap_planning_containers')
        .update(updates)
        .eq('id', containerId)
        .select()
        .single();

      if (error) throw error;
      
      setContainers(prev => prev.map(container => container.id === containerId ? data : container));
      return data;
    } catch (error) {
      console.error('Fehler beim Aktualisieren des Containers:', error);
      throw error;
    }
  };

  // Board aktualisieren
  const updateBoard = async (boardId: string, updates: Partial<RoadmapBoard>) => {
    try {
      const { data, error } = await supabase
        .from('roadmap_planning_boards')
        .update(updates)
        .eq('id', boardId)
        .select()
        .single();

      if (error) throw error;
      
      setBoards(prev => prev.map(board => board.id === boardId ? data : board));
      return data;
    } catch (error) {
      console.error('Fehler beim Aktualisieren des Boards:', error);
      throw error;
    }
  };

  // Board löschen
  const deleteBoard = async (boardId: string) => {
    try {
      const { error } = await supabase
        .from('roadmap_planning_boards')
        .delete()
        .eq('id', boardId);

      if (error) throw error;
      
      setBoards(prev => prev.filter(board => board.id !== boardId));
      toast({
        title: "Board gelöscht",
        description: "Das Board wurde erfolgreich gelöscht.",
      });
    } catch (error) {
      console.error('Fehler beim Löschen des Boards:', error);
      toast({
        title: "Fehler beim Löschen",
        description: "Das Board konnte nicht gelöscht werden.",
        variant: "destructive",
      });
    }
  };

  // Container löschen
  const deleteContainer = async (containerId: string) => {
    try {
      const { error } = await supabase
        .from('roadmap_planning_containers')
        .delete()
        .eq('id', containerId);

      if (error) throw error;
      
      setContainers(prev => prev.filter(container => container.id !== containerId));
      toast({
        title: "Container gelöscht",
        description: "Der Container wurde erfolgreich gelöscht.",
      });
    } catch (error) {
      console.error('Fehler beim Löschen des Containers:', error);
      toast({
        title: "Fehler beim Löschen",
        description: "Der Container konnte nicht gelöscht werden.",
        variant: "destructive",
      });
    }
  };

  // Card löschen
  const deleteCard = async (cardId: string) => {
    try {
      const { error } = await supabase
        .from('roadmap_planning_cards')
        .delete()
        .eq('id', cardId);

      if (error) throw error;
      
      setCards(prev => prev.filter(card => card.id !== cardId));
      toast({
        title: "Karte gelöscht",
        description: "Die Karte wurde erfolgreich gelöscht.",
      });
    } catch (error) {
      console.error('Fehler beim Löschen der Karte:', error);
      toast({
        title: "Fehler beim Löschen",
        description: "Die Karte konnte nicht gelöscht werden.",
        variant: "destructive",
      });
    }
  };

  // Initialisierung: Lade Boards und dann abhängige Daten
  useEffect(() => {
    if (roadmapId) {
      fetchBoards();
    }
  }, [roadmapId]);

  // Lade Container wenn Boards geladen sind
  useEffect(() => {
    if (boards.length > 0) {
      const boardIds = boards.map(board => board.id);
      fetchContainers(boardIds);
    } else {
      setContainers([]);
      setCards([]);
    }
  }, [boards]);

  // Lade Cards wenn Container geladen sind
  useEffect(() => {
    if (containers.length > 0) {
      const containerIds = containers.map(container => container.id);
      fetchCards(containerIds);
    } else {
      setCards([]);
    }
  }, [containers]);

  return {
    boards,
    containers,
    cards,
    isLoading,
    createBoard,
    createContainer,
    createCard,
    updateBoard,
    updateContainer,
    updateCard,
    deleteBoard,
    deleteContainer,
    deleteCard,
    refetch: fetchBoards
  };
};